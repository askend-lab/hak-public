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

  private async save(pk: string, sk: string, type: 'private' | 'shared', data: Record<string, unknown>): Promise<void> {
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

  private async get(pk: string, sk: string, type: 'private' | 'shared'): Promise<Record<string, unknown> | null> {
    const params = new URLSearchParams({ pk, sk, type });
    // Use /get-shared endpoint for shared data (no auth required)
    const endpoint = type === 'shared' ? '/get-shared' : '/get';
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
