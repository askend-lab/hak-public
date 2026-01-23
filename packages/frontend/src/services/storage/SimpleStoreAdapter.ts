import { Task, TaskEntry } from '@/types/task';

interface SimpleStoreResponse {
  success: boolean;
  item?: { data: Record<string, unknown> };
  items?: Array<{ data: Record<string, unknown> }>;
  error?: string;
}

export class SimpleStoreAdapter {
  private readonly baseUrl = '/api';
  private readonly ttl = 31536000; // 1 year in seconds

  private async save(pk: string, sk: string, type: 'private' | 'shared', data: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pk, sk, type, ttl: this.ttl, data }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SimpleStore save failed:', error);
      throw new Error(`Failed to save: ${error}`);
    }
  }

  private async get(pk: string, sk: string, type: 'private' | 'shared'): Promise<Record<string, unknown> | null> {
    const params = new URLSearchParams({ pk, sk, type });
    const response = await fetch(`${this.baseUrl}/get?${params}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.text();
      console.error('SimpleStore get failed:', error);
      throw new Error(`Failed to get: ${error}`);
    }

    const result: SimpleStoreResponse = await response.json();
    return result.item?.data ?? null;
  }

  async loadUserTasks(userId: string): Promise<Task[]> {
    try {
      const data = await this.get('tasks', userId, 'private');
      return data ? (data.tasks as Task[]) : [];
    } catch (error) {
      console.error('Failed to load user tasks:', error);
      return [];
    }
  }

  async saveUserTasks(userId: string, tasks: Task[]): Promise<void> {
    try {
      await this.save('tasks', userId, 'private', { tasks });
    } catch (error) {
      console.error('Failed to save user tasks:', error);
    }
  }

  async loadDeletedTaskIds(userId: string): Promise<string[]> {
    try {
      const data = await this.get('tasks', `deleted-${userId}`, 'private');
      return data ? (data.taskIds as string[]) : [];
    } catch (error) {
      console.error('Failed to load deleted task IDs:', error);
      return [];
    }
  }

  async saveDeletedTaskIds(userId: string, taskIds: string[]): Promise<void> {
    try {
      await this.save('tasks', `deleted-${userId}`, 'private', { taskIds });
    } catch (error) {
      console.error('Failed to save deleted task IDs:', error);
    }
  }

  async loadBaselineTaskAdditions(userId: string): Promise<Record<string, TaskEntry[]>> {
    try {
      const data = await this.get('tasks', `baseline-${userId}`, 'private');
      return data ? (data.additions as Record<string, TaskEntry[]>) : {};
    } catch (error) {
      console.error('Failed to load baseline task additions:', error);
      return {};
    }
  }

  async saveBaselineTaskAdditions(userId: string, additions: Record<string, TaskEntry[]>): Promise<void> {
    try {
      await this.save('tasks', `baseline-${userId}`, 'private', { additions });
    } catch (error) {
      console.error('Failed to save baseline task additions:', error);
    }
  }

  async loadSharedTasks(): Promise<Task[]> {
    try {
      const data = await this.get('shared', 'tasks', 'shared');
      return data ? (data.tasks as Task[]) : [];
    } catch (error) {
      console.error('Failed to load shared tasks:', error);
      return [];
    }
  }

  async saveSharedTasks(tasks: Task[]): Promise<void> {
    try {
      await this.save('shared', 'tasks', 'shared', { tasks });
    } catch (error) {
      console.error('Failed to save shared tasks:', error);
      throw error;
    }
  }

  async findAllUserTaskKeys(): Promise<string[]> {
    // In SimpleStore, we don't enumerate all users - this method is only used for share token lookup
    // which we'll handle differently
    return [];
  }

  async loadTasksByKey(_key: string): Promise<Task[]> {
    // Not needed with SimpleStore - share tokens handled via dedicated query
    return [];
  }
}
