import { nowISO } from '../../core/utils';

import { apiRequest, setAuthTokenGetter } from './httpClient';
import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from './keys';

import type { Task, TaskEntry, CreateTaskRequest, ApiResponse } from './types';

export { setAuthTokenGetter };

export async function createTask(
  userId: string,
  request: CreateTaskRequest
): Promise<ApiResponse<Task>> {
  const task: Omit<Task, 'id' | 'userId'> = {
    name: request.name,
    description: request.description,
    entries: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  return apiRequest<Task>('/save', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(String(Date.now())),
      data: task,
      type: 'private',
    }),
  });
}

export async function getTask(
  userId: string,
  taskId: string
): Promise<ApiResponse<Task>> {
  return apiRequest<Task>('/get', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(taskId),
    }),
  });
}

interface QueryResponse {
  items: { data: Task; SK: string }[];
}

function extractTaskFromItem(item: { data: Task; SK: string }): Task {
  const skParts = item.SK.split('#');
  const taskId = skParts[skParts.length - 1] ?? '';
  return {
    ...item.data,
    id: item.data.id !== '' ? item.data.id : taskId,
  };
}

export async function listTasks(userId: string): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams({
    prefix: `${buildUserPK(userId)}#${TASK_SK_PREFIX}`,
    type: 'private',
  });
  const response = await apiRequest<QueryResponse>(`/query?${params.toString()}`);
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error ?? 'Unknown error' };
  }
  
  const tasks = response.data.items.map(item => extractTaskFromItem(item));
  
  return { success: true, data: tasks };
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<ApiResponse<Task>> {
  const existing = await getTask(userId, taskId);
  if (!existing.success || !existing.data) {
    return { success: false, error: 'Task not found' };
  }

  const updated = {
    ...existing.data,
    ...updates,
    updatedAt: nowISO(),
  };

  return apiRequest<Task>('/save', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(taskId),
      data: updated,
      type: 'private',
    }),
  });
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<ApiResponse<undefined>> {
  return apiRequest<undefined>('/delete', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(taskId),
    }),
  });
}

export async function addEntryToTask(
  userId: string,
  taskId: string,
  entry: TaskEntry
): Promise<ApiResponse<Task>> {
  const existing = await getTask(userId, taskId);
  if (!existing.success || !existing.data) {
    return { success: false, error: 'Task not found' };
  }

  const entries = [...existing.data.entries, entry];
  const updated = {
    ...existing.data,
    entries,
    updatedAt: nowISO(),
  };

  return apiRequest<Task>('/save', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(taskId),
      data: updated,
      type: 'private',
    }),
  });
}
