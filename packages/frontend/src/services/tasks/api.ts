import type { Task, TaskEntry, CreateTaskRequest, ApiResponse } from './types';
import { API_CONFIG } from '../config';
import { buildUserPK, buildTaskSK, TASK_SK_PREFIX } from './keys';
import { nowISO } from '../../core/utils';

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
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    return { success: false, error: `API error: ${response.status}` };
  }

  const data = await response.json();
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

export async function listTasks(userId: string): Promise<ApiResponse<Task[]>> {
  return apiRequest<Task[]>('/query', {
    method: 'POST',
    body: JSON.stringify({
      pk: buildUserPK(userId),
      skPrefix: TASK_SK_PREFIX,
    }),
  });
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
): Promise<ApiResponse<void>> {
  return apiRequest<void>('/delete', {
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
