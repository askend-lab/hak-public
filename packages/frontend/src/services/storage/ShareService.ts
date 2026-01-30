import { Task } from '@/types/task';
import { SimpleStoreAdapter } from './SimpleStoreAdapter';
import { MockDataLoader } from './MockDataLoader';

export class ShareService {
  constructor(
    private storage: SimpleStoreAdapter,
    private mockLoader: MockDataLoader
  ) {}

  generateShareToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  }

  async getSharedTask(taskId: string): Promise<Task | null> {
    console.log('Getting shared task:', taskId);
    
    // Check baseline tasks only - no shared storage fallback
    const mockLoader = new MockDataLoader();
    const baselineTasks = await mockLoader.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);
    if (baselineTask) {
      console.log('Found baseline task:', baselineTask);
      return baselineTask;
    }

    // Note: This method is deprecated. Use getTaskByShareToken instead.
    // Tasks are now stored as unlisted and accessed by shareToken, not by ID.
    console.log('No baseline task found for ID:', taskId);
    return null;
  }

  async shareUserTask(task: Task): Promise<void> {
    console.log('Sharing task:', task);

    try {
      // Save task as unlisted - directly accessible by shareToken
      await this.storage.saveTaskAsUnlisted(task);
      console.log('Task shared successfully as unlisted:', task.shareToken);
    } catch (error) {
      console.error('Failed to share task:', error);
      throw new Error('Failed to share task');
    }
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    console.log('Looking for share token:', shareToken);

    // First check baseline tasks
    const baselineTask = await this.mockLoader.findTaskByShareToken(shareToken);
    if (baselineTask) {
      console.log('Found baseline task with share token:', baselineTask);
      return baselineTask;
    }

    // Direct lookup by shareToken in unlisted storage - O(1)
    const unlistedTask = await this.storage.getTaskByShareToken(shareToken);
    if (unlistedTask) {
      console.log('Found unlisted task with share token:', unlistedTask);
      return unlistedTask;
    }

    console.log('No task found with share token:', shareToken);
    return null;
  }
}
