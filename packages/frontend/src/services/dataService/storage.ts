import { Task, TaskEntry } from '@/types/task';
import mockTasksData from '../../../public/data/mock-tasks.json';

// Helper to ensure optional properties are null instead of undefined
const ensureTaskEntry = (entry: TaskEntry, taskId: string, taskCreatedAt: Date): TaskEntry => ({
  ...entry,
  taskId: entry.taskId || taskId,
  audioBlob: entry.audioBlob || null,
  createdAt: entry.createdAt ? new Date(entry.createdAt) : taskCreatedAt
});

export async function loadBaselineTasks(): Promise<Task[]> {
  try {
    const data = mockTasksData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.tasks as any[]).map((task) => ({
      ...task,
      shareToken: task.shareToken || generateShareToken(),
      speechSequences: task.speechSequences || task.entries?.map((e: TaskEntry) => e.text) || [],
      entries: task.entries?.map((entry: TaskEntry) => ensureTaskEntry(entry, task.id, new Date(task.createdAt))) || [],
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  } catch (error) {
    console.error('Failed to load baseline tasks:', error);
    return [];
  }
}

export function loadUserTasks(userId: string): Task[] {
  try {
    const key = `eki_user_tasks_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load user tasks from localStorage:', error);
    return [];
  }
}

export function loadDeletedTaskIds(userId: string): string[] {
  try {
    const key = `eki_deleted_tasks_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load deleted task IDs:', error);
    return [];
  }
}

export function saveDeletedTaskIds(userId: string, taskIds: string[]): void {
  try {
    const key = `eki_deleted_tasks_${userId}`;
    localStorage.setItem(key, JSON.stringify(taskIds));
  } catch (error) {
    console.error('Failed to save deleted task IDs:', error);
  }
}

export function saveUserTasks(userId: string, tasks: Task[]): void {
  try {
    const key = `eki_user_tasks_${userId}`;
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save user tasks to localStorage:', error);
  }
}

export function loadBaselineTaskAdditions(userId: string): Record<string, TaskEntry[]> {
  try {
    const key = `eki_baseline_additions_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load baseline task additions:', error);
    return {};
  }
}

export function saveBaselineTaskAdditions(userId: string, additions: Record<string, TaskEntry[]>): void {
  try {
    const key = `eki_baseline_additions_${userId}`;
    localStorage.setItem(key, JSON.stringify(additions));
  } catch (error) {
    console.error('Failed to save baseline task additions:', error);
  }
}

export function loadSharedTasks(): Task[] {
  try {
    const stored = localStorage.getItem('eki_shared_tasks');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load shared tasks:', error);
    return [];
  }
}

export function saveSharedTasks(tasks: Task[]): void {
  try {
    localStorage.setItem('eki_shared_tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save shared tasks:', error);
  }
}

export function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);
}
