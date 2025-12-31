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

const MOCK_TASKS: Task[] = [
  {
    id: 'mock-1',
    userId: 'mock-user',
    name: 'Hääldusharjutused',
    description: 'Eesti keele hääldusharjutused algajatele',
    entries: [
      { id: 'e1000000-0000-0000-0000-000000000001', synthesis: { id: 's1000000-0000-0000-0000-000000000001', originalText: 'Tere', phoneticText: 'tere', audioHash: 'h1', voiceModel: 'efm_s', createdAt: '2024-12-01T10:00:00Z' }, order: 0, addedAt: '2024-12-01T10:00:00Z' },
      { id: 'e1000000-0000-0000-0000-000000000002', synthesis: { id: 's1000000-0000-0000-0000-000000000002', originalText: 'Head aega', phoneticText: 'head aega', audioHash: 'h2', voiceModel: 'efm_s', createdAt: '2024-12-01T10:01:00Z' }, order: 1, addedAt: '2024-12-01T10:01:00Z' },
    ],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
  },
  {
    id: 'mock-2',
    userId: 'mock-user',
    name: 'Numbrite õppimine',
    description: 'Numbrid 1-100',
    entries: [
      { id: 'e1000000-0000-0000-0000-000000000003', synthesis: { id: 's1000000-0000-0000-0000-000000000003', originalText: 'Üks', phoneticText: 'üks', audioHash: 'h3', voiceModel: 'efm_s', createdAt: '2024-12-05T09:00:00Z' }, order: 0, addedAt: '2024-12-05T09:00:00Z' },
    ],
    createdAt: '2024-12-05T09:00:00Z',
    updatedAt: '2024-12-05T09:00:00Z',
  },
  {
    id: 'mock-3',
    userId: 'mock-user',
    name: 'Igapäevased väljendid',
    description: '',
    entries: [],
    createdAt: '2024-12-20T16:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
  },
];

export async function listTasks(userId: string): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams({
    prefix: `${buildUserPK(userId)}#${TASK_SK_PREFIX}`,
    type: 'private',
  });
  
  const response = await apiRequest<QueryResponse>(`/query?${params.toString()}`);
  
  // Check if we're in development mode (safely handle undefined)
  // Note: env values can be strings ('true') or booleans
  const isDev = typeof import.meta !== 'undefined' && !!import.meta.env?.DEV;
  const isTest = typeof import.meta !== 'undefined' && !!import.meta.env?.VITEST;
  const useMockFallback = isDev && !isTest;

  if (!response.success) {
    // In development, return mock data on failure
    if (useMockFallback) {
      return { success: true, data: MOCK_TASKS };
    }
    return { success: false, error: response.error ?? 'Unknown error' };
  }
  
  if (response.data && response.data.items.length > 0) {
    const tasks = response.data.items.map(item => extractTaskFromItem(item));
    return { success: true, data: tasks };
  }
  
  // Empty result - return mock data in dev, empty array otherwise
  if (useMockFallback) {
    return { success: true, data: MOCK_TASKS };
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
