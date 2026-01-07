import { nowISO } from '../../core/utils';

import { apiRequest, setAuthTokenGetter } from './httpClient';
import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from './keys';

import type { Task, TaskEntry, CreateTaskRequest, ApiResponse } from './types';

export { setAuthTokenGetter };

interface SaveResponse {
  item: { data: Task; SK: string; PK: string };
}

export async function createTask(
  userId: string,
  request: CreateTaskRequest
): Promise<ApiResponse<Task>> {
  const taskId = String(Date.now());
  const task: Omit<Task, 'id' | 'userId'> = {
    name: request.name,
    description: request.description,
    entries: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  const response = await apiRequest<SaveResponse>('/save', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      sk: buildTaskSK(taskId),
      data: task,
      type: 'private',
      ttl: 0, // 0 = no expiration
    }),
  });

  if (!response.success || !response.data?.item) {
    return { success: false, error: response.error ?? 'Failed to create task' };
  }

  return { success: true, data: { ...response.data.item.data, id: taskId } };
}

interface GetResponse {
  item: { data: Task; SK: string; PK: string };
}

export async function getTask(
  userId: string,
  taskId: string
): Promise<ApiResponse<Task>> {
  const params = new URLSearchParams({
    pk: buildUserPK(userId),
    sk: buildTaskSK(taskId),
    type: 'private',
  });

  const response = await apiRequest<GetResponse>(`/get?${params.toString()}`);

  if (!response.success || !response.data?.item) {
    return { success: false, error: response.error ?? 'Task not found' };
  }

  const task = extractTaskFromItem(response.data.item);
  return { success: true, data: task };
}

interface QueryResponse {
  items: { data: Task; SK: string }[];
}

function extractTaskFromItem(item: { data: Task; SK: string }): Task {
  const skParts = item.SK.split('#');
  const taskId = skParts[skParts.length - 1] ?? '';
  return {
    ...item.data,
    id: item.data.id && item.data.id !== '' ? item.data.id : taskId,
  };
}

export async function listTasks(userId: string): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams({
    prefix: `${buildUserPK(userId)}#${TASK_SK_PREFIX}`,
    type: 'private',
  });
  
  const response = await apiRequest<QueryResponse>(`/query?${params.toString()}`);

  if (!response.success) {
    return { success: false, error: response.error ?? 'Unknown error' };
  }
  
  if (response.data && response.data.items.length > 0) {
    const tasks = response.data.items.map(item => extractTaskFromItem(item));
    return { success: true, data: tasks };
  }
  
  return { success: true, data: [] };
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
      ttl: 0,
    }),
  });
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<ApiResponse<undefined>> {
  const params = new URLSearchParams({
    pk: buildUserPK(userId),
    sk: buildTaskSK(taskId),
    type: 'private',
  });

  return apiRequest<undefined>(`/delete?${params.toString()}`, {
    method: 'DELETE',
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
      ttl: 0,
    }),
  });
}
