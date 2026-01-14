import { Task, TaskEntry } from '@/types/task';

export class LocalStorageAdapter {
  private getKey(userId: string, type: 'tasks' | 'deleted' | 'additions'): string {
    const prefixes = {
      tasks: 'eki_user_tasks',
      deleted: 'eki_deleted_tasks',
      additions: 'eki_baseline_additions'
    };
    return `${prefixes[type]}_${userId}`;
  }

  loadUserTasks(userId: string): Task[] {
    try {
      const key = this.getKey(userId, 'tasks');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load user tasks from localStorage:', error);
      return [];
    }
  }

  saveUserTasks(userId: string, tasks: Task[]): void {
    try {
      const key = this.getKey(userId, 'tasks');
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save user tasks to localStorage:', error);
    }
  }

  loadDeletedTaskIds(userId: string): string[] {
    try {
      const key = this.getKey(userId, 'deleted');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load deleted task IDs:', error);
      return [];
    }
  }

  saveDeletedTaskIds(userId: string, taskIds: string[]): void {
    try {
      const key = this.getKey(userId, 'deleted');
      localStorage.setItem(key, JSON.stringify(taskIds));
    } catch (error) {
      console.error('Failed to save deleted task IDs:', error);
    }
  }

  loadBaselineTaskAdditions(userId: string): Record<string, TaskEntry[]> {
    try {
      const key = this.getKey(userId, 'additions');
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load baseline task additions:', error);
      return {};
    }
  }

  saveBaselineTaskAdditions(userId: string, additions: Record<string, TaskEntry[]>): void {
    try {
      const key = this.getKey(userId, 'additions');
      localStorage.setItem(key, JSON.stringify(additions));
    } catch (error) {
      console.error('Failed to save baseline task additions:', error);
    }
  }

  loadSharedTasks(): Task[] {
    try {
      const key = 'eki_shared_tasks';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load shared tasks:', error);
      return [];
    }
  }

  saveSharedTasks(tasks: Task[]): void {
    try {
      const key = 'eki_shared_tasks';
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save shared tasks:', error);
      throw error;
    }
  }

  findAllUserTaskKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('eki_user_tasks_')) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error('Failed to enumerate localStorage keys:', error);
    }
    return keys;
  }

  loadTasksByKey(key: string): Task[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Failed to load tasks by key ${key}:`, error);
      return [];
    }
  }
}
