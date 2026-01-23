import { vi } from 'vitest';
import { Task, TaskEntry } from '@/types/task';

// In-memory storage to simulate SimpleStore
let userTasks: Record<string, Task[]> = {};
let deletedTaskIds: Record<string, string[]> = {};
let baselineAdditions: Record<string, Record<string, TaskEntry[]>> = {};
let sharedTasks: Task[] = [];

export function resetSimpleStoreMock(): void {
  userTasks = {};
  deletedTaskIds = {};
  baselineAdditions = {};
  sharedTasks = [];
}

export function setupSimpleStoreMock(): void {
  resetSimpleStoreMock();
  
  global.fetch = vi.fn(async (url: string, options?: RequestInit) => {
    const urlObj = new URL(url, 'http://localhost');
    const path = urlObj.pathname;
    
    if (path === '/api/save' && options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const { pk, sk, data } = body;
      
      if (pk === 'tasks' && !sk.startsWith('deleted-') && !sk.startsWith('baseline-')) {
        userTasks[sk] = data.tasks || [];
      } else if (pk === 'tasks' && sk.startsWith('deleted-')) {
        const userId = sk.replace('deleted-', '');
        deletedTaskIds[userId] = data.taskIds || [];
      } else if (pk === 'tasks' && sk.startsWith('baseline-')) {
        const userId = sk.replace('baseline-', '');
        baselineAdditions[userId] = data.additions || {};
      } else if (pk === 'shared' && sk === 'tasks') {
        sharedTasks = data.tasks || [];
      }
      
      return { ok: true, json: async (): Promise<{ success: boolean }> => ({ success: true }) };
    }
    
    if (path === '/api/get') {
      const pk = urlObj.searchParams.get('pk');
      const sk = urlObj.searchParams.get('sk');
      
      if (pk === 'tasks' && sk && !sk.startsWith('deleted-') && !sk.startsWith('baseline-')) {
        const tasks = userTasks[sk] || [];
        if (tasks.length === 0) {
          return { ok: false, status: 404 };
        }
        return { ok: true, json: async (): Promise<{ success: boolean; item: { data: { tasks: Task[] } } }> => ({ success: true, item: { data: { tasks } } }) };
      } else if (pk === 'tasks' && sk?.startsWith('deleted-')) {
        const userId = sk.replace('deleted-', '');
        const taskIds = deletedTaskIds[userId] || [];
        if (taskIds.length === 0) {
          return { ok: false, status: 404 };
        }
        return { ok: true, json: async (): Promise<{ success: boolean; item: { data: { taskIds: string[] } } }> => ({ success: true, item: { data: { taskIds } } }) };
      } else if (pk === 'tasks' && sk?.startsWith('baseline-')) {
        const userId = sk.replace('baseline-', '');
        const additions = baselineAdditions[userId] || {};
        if (Object.keys(additions).length === 0) {
          return { ok: false, status: 404 };
        }
        return { ok: true, json: async (): Promise<{ success: boolean; item: { data: { additions: Record<string, TaskEntry[]> } } }> => ({ success: true, item: { data: { additions } } }) };
      } else if (pk === 'shared' && sk === 'tasks') {
        if (sharedTasks.length === 0) {
          return { ok: false, status: 404 };
        }
        return { ok: true, json: async (): Promise<{ success: boolean; item: { data: { tasks: Task[] } } }> => ({ success: true, item: { data: { tasks: sharedTasks } } }) };
      }
      
      return { ok: false, status: 404 };
    }
    
    return { ok: false, status: 404 };
  }) as unknown as typeof fetch;
}

export function getStoredUserTasks(userId: string): Task[] {
  return userTasks[userId] || [];
}

export function getStoredDeletedTaskIds(userId: string): string[] {
  return deletedTaskIds[userId] || [];
}

export function getStoredBaselineAdditions(userId: string): Record<string, TaskEntry[]> {
  return baselineAdditions[userId] || {};
}

export function getStoredSharedTasks(): Task[] {
  return sharedTasks;
}
