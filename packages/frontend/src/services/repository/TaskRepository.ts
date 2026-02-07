import { Task, TaskEntry, TaskSummary, CreateTaskRequest } from '@/types/task';
import { SimpleStoreAdapter } from '../storage/SimpleStoreAdapter';
import { MockDataLoader } from '../storage/MockDataLoader';
import { ShareService } from '../storage/ShareService';

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class TaskRepository {
  constructor(
    private storage: SimpleStoreAdapter,
    private mockLoader: MockDataLoader,
    private shareService: ShareService
  ) {}

  async getUserTasks(userId: string): Promise<TaskSummary[]> {
    const [baselineTasks, userTasks, baselineAdditions] = await Promise.all([
      this.mockLoader.loadBaselineTasks(),
      this.storage.loadUserTasks(userId),
      this.storage.loadBaselineTaskAdditions(userId)
    ]);

    const userBaselineTasks = baselineTasks
      .filter(task => task.userId === userId)
      .map(task => ({
        ...task,
        entries: [
          ...(task.entries ?? []),
          ...(baselineAdditions[task.id] ?? [])
        ]
      }));

    const allTasks = [...userBaselineTasks, ...userTasks];

    return allTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }

  async getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
    const userTasks = await this.storage.loadUserTasks(userId);

    return userTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }

  async getModifiableTasks(userId: string): Promise<TaskSummary[]> {
    return this.getUserCreatedTasks(userId);
  }

  async getTask(taskId: string, userId: string): Promise<Task | null> {
    const [baselineTasks, userTasks, baselineAdditions] = await Promise.all([
      this.mockLoader.loadBaselineTasks(),
      this.storage.loadUserTasks(userId),
      this.storage.loadBaselineTaskAdditions(userId)
    ]);

    const userTask = userTasks.find(task => task.id === taskId);
    if (userTask) {
      return userTask;
    }

    const baselineTask = baselineTasks.find(task => task.id === taskId);
    if (baselineTask) {
      return {
        ...baselineTask,
        entries: [
          ...(baselineTask.entries ?? []),
          ...(baselineAdditions[taskId] ?? [])
        ]
      };
    }

    return null;
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const taskId = generateId('task');
    const newTask: Task = {
      id: taskId,
      userId,
      name: taskData.name,
      description: taskData.description ?? null,
      speechSequences: taskData.speechSequences ?? [],
      entries: (taskData.speechEntries?.map((entry, index) => ({
        id: `entry_${Date.now()}_${index}`,
        taskId,
        text: entry.text,
        stressedText: entry.stressedText,
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      })) ?? taskData.speechSequences?.map((text, index) => ({
        id: `entry_${Date.now()}_${index}`,
        taskId,
        text,
        stressedText: text,
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      }))) ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: this.shareService.generateShareToken()
    };

    const userTasks = await this.storage.loadUserTasks(userId);
    userTasks.push(newTask);
    await this.storage.saveUserTasks(userId, userTasks);
    
    // Also save as unlisted for anonymous access via shareToken
    await this.storage.saveTaskAsUnlisted(newTask);

    return newTask;
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const userTasks = await this.storage.loadUserTasks(userId);
    const taskIndex = userTasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      const existingTask = userTasks[taskIndex];
      if (!existingTask) return null;
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date()
      };

      userTasks[taskIndex] = updatedTask;
      await this.storage.saveUserTasks(userId, userTasks);
      // Sync unlisted storage for anonymous access
      await this.storage.saveTaskAsUnlisted(updatedTask);
      return updatedTask;
    }

    const baselineTasks = await this.mockLoader.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);

    if (baselineTask) {
      const baselineAdditions = await this.storage.loadBaselineTaskAdditions(userId);
      const additionalEntries = baselineAdditions[taskId] ?? [];

      const mergedEntries = [
        ...(baselineTask.entries ?? []),
        ...additionalEntries
      ];

      const taskCopy: Task = {
        ...baselineTask,
        userId,
        entries: mergedEntries,
        ...updates,
        id: generateId('task'),
        updatedAt: new Date(),
        shareToken: this.shareService.generateShareToken()
      };

      userTasks.push(taskCopy);
      await this.storage.saveUserTasks(userId, userTasks);

      if (baselineAdditions[taskId]) {
        delete baselineAdditions[taskId];
        await this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
      }

      return taskCopy;
    }

    throw new Error('Task not found');
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const userTasks = await this.storage.loadUserTasks(userId);
    const taskIndex = userTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      userTasks.splice(taskIndex, 1);
      await this.storage.saveUserTasks(userId, userTasks);
      return true;
    }
    
    const baselineTasks = await this.mockLoader.loadBaselineTasks();
    const isBaselineTask = baselineTasks.some(task => 
      task.id === taskId && task.userId === userId
    );
    
    if (isBaselineTask) {
      // Baseline tasks cannot be deleted - they are read-only
      throw new Error('Cannot delete baseline task');
    }
    
    throw new Error('Task not found');
  }

  async addTextEntriesToTask(userId: string, taskId: string, textEntries: string[] | Array<{text: string; stressedText: string}>): Promise<TaskEntry[]> {
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    const userTasks = await this.storage.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);
    
    const currentEntries = task.entries ?? [];
    const maxOrder = currentEntries.length > 0 ? Math.max(...currentEntries.map(e => e.order)) : 0;
    
    const newEntries: TaskEntry[] = textEntries.map((entry, index) => {
      const isStringEntry = typeof entry === 'string';
      return {
        id: generateId('entry'),
        taskId,
        text: isStringEntry ? entry : entry.text,
        stressedText: isStringEntry ? entry : entry.stressedText,
        audioUrl: null,
        audioBlob: null,
        order: maxOrder + index + 1,
        createdAt: new Date()
      };
    });
    
    if (isUserTask) {
      const updatedEntries = [...currentEntries, ...newEntries];
      await this.updateTask(userId, taskId, { 
        entries: updatedEntries,
        speechSequences: [...(task.speechSequences ?? []), ...textEntries.map(entry => 
          typeof entry === 'string' ? entry : entry.text
        )]
      });
    } else {
      const baselineAdditions = await this.storage.loadBaselineTaskAdditions(userId);
      const existingAdditions = baselineAdditions[taskId] ?? [];
      baselineAdditions[taskId] = [...existingAdditions, ...newEntries];
      await this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
    }

    return newEntries;
  }

  async updateTaskEntry(userId: string, taskId: string, entryId: string, updates: Partial<Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>>): Promise<TaskEntry | null> {
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    const entryIndex = task.entries?.findIndex(entry => entry.id === entryId);
    if (entryIndex === undefined || entryIndex === -1) {
      throw new Error('Entry not found');
    }

    const existingEntry = task.entries?.[entryIndex];
    if (!existingEntry) throw new Error('Entry not found');
    const updatedEntry: TaskEntry = {
      ...existingEntry,
      ...updates
    };

    const updatedEntries = [...(task.entries ?? [])];
    updatedEntries[entryIndex] = updatedEntry;

    const userTasks = await this.storage.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);

    if (isUserTask) {
      await this.updateTask(userId, taskId, { entries: updatedEntries });
    } else {
      const baselineTasks = await this.mockLoader.loadBaselineTasks();
      const baselineTask = baselineTasks.find(task => task.id === taskId);

      if (baselineTask) {
        const baselineAdditions = await this.storage.loadBaselineTaskAdditions(userId);
        const baselineEntryCount = baselineTask.entries?.length || 0;

        if (entryIndex < baselineEntryCount) {
          await this.updateTask(userId, taskId, { entries: updatedEntries });
        } else {
          const additions = baselineAdditions[taskId] ?? [];
          const additionIndex = entryIndex - baselineEntryCount;
          if (additionIndex >= 0 && additionIndex < additions.length) {
            additions[additionIndex] = updatedEntry;
            baselineAdditions[taskId] = additions;
            await this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
          }
        }
      }
    }

    return updatedEntry;
  }
}
