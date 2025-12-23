import { nowISO } from '../../core/utils';
import { API_CONFIG } from '../config';

import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from './keys';

import type { Task, TaskEntry, CreateTaskRequest, ApiResponse } from './types';


let authTokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = authTokenGetter?.();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token !== null && token !== '' ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    return { success: false, error: `API error: ${String(response.status)}` };
  }

  const data = await response.json() as T;
  return { success: true, data };
}

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

export async function listTasks(userId: string): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams({
    prefix: `${buildUserPK(userId)}#${TASK_SK_PREFIX}`,
    type: 'private',
  });
  const response = await apiRequest<QueryResponse>(`/query?${params.toString()}`);
  
  if (!response.success || !response.data) {
    return { success: false, error: response.error };
  }
  
  // Transform items: extract data and derive id from SK
  const tasks = response.data.items.map(item => {
    const skParts = item.SK.split('#');
    const taskId = skParts[skParts.length - 1]; // Get last part after TASK#
    return {
      ...item.data,
      id: item.data.id || taskId,
    };
  });
  
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
  return updateTask(userId, taskId, { entries });
}
