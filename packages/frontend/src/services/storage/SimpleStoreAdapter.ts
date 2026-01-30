import { Task, TaskEntry } from '@/types/task';
import { AuthStorage } from '../auth/storage';

interface SimpleStoreResponse {
  success: boolean;
  item?: { data: Record<string, unknown> };
  items?: Array<{ data: Record<string, unknown> }>;
  error?: string;
}

export class SimpleStoreAdapter {
  private readonly baseUrl = '/api';
  private readonly ttl = 31536000; // 1 year in seconds

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Cognito authorizer requires ID token, not access token
    const token = AuthStorage.getIdToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async save(pk: string, sk: string, type: 'private' | 'shared' | 'unlisted', data: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ pk, sk, type, ttl: this.ttl, data }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SimpleStore save failed:', error);
      throw new Error(`Failed to save: ${error}`);
    }
  }

  private async get(pk: string, sk: string, type: 'private' | 'shared' | 'unlisted'): Promise<Record<string, unknown> | null> {
    const params = new URLSearchParams({ pk, sk, type });
    // Use /get endpoint for all types - backend handles auth based on type
    const endpoint = '/get';
    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
      headers: this.getAuthHeaders(),
    });

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
    const data = await this.get('tasks', userId, 'private');
    return data ? (data.tasks as Task[]) : [];
  }

  async saveUserTasks(userId: string, tasks: Task[]): Promise<void> {
    await this.save('tasks', userId, 'private', { tasks });
  }

  async loadBaselineTaskAdditions(userId: string): Promise<Record<string, TaskEntry[]>> {
    const data = await this.get('tasks', `baseline-${userId}`, 'private');
    return data ? (data.additions as Record<string, TaskEntry[]>) : {};
  }

  async saveBaselineTaskAdditions(userId: string, additions: Record<string, TaskEntry[]>): Promise<void> {
    await this.save('tasks', `baseline-${userId}`, 'private', { additions });
  }

  async loadSharedTasks(): Promise<Task[]> {
    const data = await this.get('shared', 'tasks', 'shared');
    return data ? (data.tasks as Task[]) : [];
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

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    try {
      const data = await this.get('tasks', shareToken, 'unlisted');
      return data ? (data as unknown as Task) : null;
    } catch (error) {
      console.error('Failed to get task by share token:', error);
      return null;
    }
  }

  async saveTaskAsUnlisted(task: Task): Promise<void> {
    if (!task.shareToken) {
      throw new Error('Task must have shareToken to save as unlisted');
    }
    await this.save('tasks', task.shareToken, 'unlisted', task as unknown as Record<string, unknown>);
  }
}
