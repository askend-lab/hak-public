/* eslint-disable max-lines-per-function, max-lines */
import { Task, TaskEntry, TaskSummary, CreateTaskRequest } from '@/types/task';
import { LocalStorageAdapter } from '../storage/LocalStorageAdapter';
import { MockDataLoader } from '../storage/MockDataLoader';
import { ShareService } from '../storage/ShareService';

export class TaskRepository {
  constructor(
    private storage: LocalStorageAdapter,
    private mockLoader: MockDataLoader,
    private shareService: ShareService
  ) {}

  async getUserTasks(userId: string): Promise<TaskSummary[]> {
    const [baselineTasks, userTasks, deletedTaskIds, baselineAdditions] = await Promise.all([
      this.mockLoader.loadBaselineTasks(),
      Promise.resolve(this.storage.loadUserTasks(userId)),
      Promise.resolve(this.storage.loadDeletedTaskIds(userId)),
      Promise.resolve(this.storage.loadBaselineTaskAdditions(userId))
    ]);

    const userBaselineTasks = baselineTasks
      .filter(task => task.userId === userId)
      .map(task => ({
        ...task,
        entries: [
          ...(task.entries || []),
          ...(baselineAdditions[task.id] || [])
        ]
      }));

    const allTasks = [...userBaselineTasks, ...userTasks];
    const activeTasks = allTasks.filter(task => !deletedTaskIds.includes(task.id));

    return activeTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }

  async getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
    const userTasks = this.storage.loadUserTasks(userId);

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
      Promise.resolve(this.storage.loadUserTasks(userId)),
      Promise.resolve(this.storage.loadBaselineTaskAdditions(userId))
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
          ...(baselineTask.entries || []),
          ...(baselineAdditions[taskId] || [])
        ]
      };
    }

    return null;
  }

  async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    console.log('Creating task for userId:', userId);
    console.log('Task data:', taskData);
    
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      name: taskData.name,
      description: taskData.description ?? null,
      speechSequences: taskData.speechSequences || [],
      entries: taskData.speechEntries?.map((entry, index) => ({
        id: `entry_${Date.now()}_${index}`,
        taskId: '',
        text: entry.text,
        stressedText: entry.stressedText,
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      })) || taskData.speechSequences?.map((text, index) => ({
        id: `entry_${Date.now()}_${index}`,
        taskId: '',
        text,
        stressedText: text,
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      })) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: this.shareService.generateShareToken()
    };

    console.log('Generated new task:', newTask);

    newTask.entries.forEach(entry => {
      entry.taskId = newTask.id;
    });

    const userTasks = this.storage.loadUserTasks(userId);
    console.log('Existing user tasks before save:', userTasks);
    userTasks.push(newTask);
    this.storage.saveUserTasks(userId, userTasks);
    console.log('Task saved to localStorage with key:', `eki_user_tasks_${userId}`);
    
    const savedTasks = this.storage.loadUserTasks(userId);
    console.log('Tasks after save:', savedTasks);
    const savedTask = savedTasks.find(t => t.id === newTask.id);
    console.log('Newly saved task found:', savedTask);

    return newTask;
  }

  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const userTasks = this.storage.loadUserTasks(userId);
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
      this.storage.saveUserTasks(userId, userTasks);
      return updatedTask;
    }

    const baselineTasks = await this.mockLoader.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);

    if (baselineTask) {
      const baselineAdditions = this.storage.loadBaselineTaskAdditions(userId);
      const additionalEntries = baselineAdditions[taskId] || [];

      const mergedEntries = [
        ...(baselineTask.entries || []),
        ...additionalEntries
      ];

      const taskCopy: Task = {
        ...baselineTask,
        userId,
        entries: mergedEntries,
        ...updates,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        updatedAt: new Date(),
        shareToken: this.shareService.generateShareToken()
      };

      userTasks.push(taskCopy);
      this.storage.saveUserTasks(userId, userTasks);

      const deletedTaskIds = this.storage.loadDeletedTaskIds(userId);
      if (!deletedTaskIds.includes(taskId)) {
        deletedTaskIds.push(taskId);
        this.storage.saveDeletedTaskIds(userId, deletedTaskIds);
      }

      if (baselineAdditions[taskId]) {
        delete baselineAdditions[taskId];
        this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
      }

      return taskCopy;
    }

    throw new Error('Task not found');
  }

  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const userTasks = this.storage.loadUserTasks(userId);
    const taskIndex = userTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      userTasks.splice(taskIndex, 1);
      this.storage.saveUserTasks(userId, userTasks);
      return true;
    }
    
    const baselineTasks = await this.mockLoader.loadBaselineTasks();
    const isBaselineTask = baselineTasks.some(task => 
      task.id === taskId && task.userId === userId
    );
    
    if (isBaselineTask) {
      const deletedTaskIds = this.storage.loadDeletedTaskIds(userId);
      if (!deletedTaskIds.includes(taskId)) {
        deletedTaskIds.push(taskId);
        this.storage.saveDeletedTaskIds(userId, deletedTaskIds);
      }
      return true;
    }
    
    throw new Error('Task not found');
  }

  async addTextEntriesToTask(userId: string, taskId: string, textEntries: string[] | Array<{text: string; stressedText: string}>): Promise<TaskEntry[]> {
    console.log('Adding text entries to task:', { userId, taskId, textEntries });
    
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    console.log('Found task:', task);

    const userTasks = this.storage.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);
    
    console.log('Is user task:', isUserTask, 'User tasks count:', userTasks.length);
    
    const currentEntries = task.entries || [];
    const maxOrder = currentEntries.length > 0 ? Math.max(...currentEntries.map(e => e.order)) : 0;
    
    const newEntries: TaskEntry[] = textEntries.map((entry, index) => {
      const isStringEntry = typeof entry === 'string';
      return {
        id: `entry_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 11)}`,
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
        speechSequences: [...(task.speechSequences || []), ...textEntries.map(entry => 
          typeof entry === 'string' ? entry : entry.text
        )]
      });
    } else {
      const baselineAdditions = this.storage.loadBaselineTaskAdditions(userId);
      const existingAdditions = baselineAdditions[taskId] || [];
      baselineAdditions[taskId] = [...existingAdditions, ...newEntries];
      this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
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

    const userTasks = this.storage.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);

    if (isUserTask) {
      await this.updateTask(userId, taskId, { entries: updatedEntries });
    } else {
      const baselineTasks = await this.mockLoader.loadBaselineTasks();
      const baselineTask = baselineTasks.find(task => task.id === taskId);

      if (baselineTask) {
        const baselineAdditions = this.storage.loadBaselineTaskAdditions(userId);
        const baselineEntryCount = baselineTask.entries?.length || 0;

        if (entryIndex < baselineEntryCount) {
          await this.updateTask(userId, taskId, { entries: updatedEntries });
        } else {
          const additions = baselineAdditions[taskId] || [];
          const additionIndex = entryIndex - baselineEntryCount;
          if (additionIndex >= 0 && additionIndex < additions.length) {
            additions[additionIndex] = updatedEntry;
            baselineAdditions[taskId] = additions;
            this.storage.saveBaselineTaskAdditions(userId, baselineAdditions);
          }
        }
      }
    }

    return updatedEntry;
  }
}
