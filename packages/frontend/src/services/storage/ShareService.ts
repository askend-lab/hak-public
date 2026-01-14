import { Task } from '@/types/task';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { MockDataLoader } from './MockDataLoader';

export class ShareService {
  constructor(
    private storage: LocalStorageAdapter,
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
    
    const mockLoader = new MockDataLoader();
    const baselineTasks = await mockLoader.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);
    if (baselineTask) {
      console.log('Found baseline task:', baselineTask);
      return baselineTask;
    }

    const sharedTasks = this.storage.loadSharedTasks();
    console.log('Shared tasks storage:', sharedTasks);
    
    const sharedTask = sharedTasks.find(task => task.id === taskId);
    if (sharedTask) {
      console.log('Found shared task:', sharedTask);
      return sharedTask;
    }

    console.log('No shared task found for ID:', taskId);
    return null;
  }

  async shareUserTask(task: Task): Promise<void> {
    console.log('Sharing task:', task);

    try {
      const sharedTasks = this.storage.loadSharedTasks();
      console.log('Current shared tasks:', sharedTasks);
      
      const filteredTasks = sharedTasks.filter(t => t.id !== task.id);
      filteredTasks.push(task);
      
      this.storage.saveSharedTasks(filteredTasks);
      
      console.log('Task shared successfully. New shared tasks:', filteredTasks);
    } catch (error) {
      console.error('Failed to share task:', error);
      throw new Error('Failed to share task');
    }
  }

  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    console.log('Looking for share token:', shareToken);

    const baselineTask = await this.mockLoader.findTaskByShareToken(shareToken);
    if (baselineTask) {
      console.log('Found baseline task with share token:', baselineTask);
      return baselineTask;
    }

    const sharedTasks = this.storage.loadSharedTasks();
    console.log('Checking global shared tasks storage');
    const sharedTask = sharedTasks.find(task => task.shareToken === shareToken);
    if (sharedTask) {
      console.log('Found shared task with share token:', sharedTask);
      return sharedTask;
    }

    const allUserTaskKeys = this.storage.findAllUserTaskKeys();
    console.log('Checking user task keys:', allUserTaskKeys);

    for (const key of allUserTaskKeys) {
      const userTasks = this.storage.loadTasksByKey(key);
      const userTask = userTasks.find(task => task.shareToken === shareToken);
      if (userTask) {
        console.log('Found user task with share token:', userTask);
        return userTask;
      }
    }

    console.log('No task found with share token:', shareToken);
    return null;
  }
}
