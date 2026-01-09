import { Task, TaskSummary, TaskEntry, CreateTaskRequest } from '@/types/task';
import mockTasksData from '../../public/data/mock-tasks.json';

export class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Load baseline tasks from JSON
  private async loadBaselineTasks(): Promise<Task[]> {
    try {
      // Use imported JSON data directly
      const data = mockTasksData;
      
      // Normalize baseline tasks to match Task interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.tasks as any[]).map((task) => ({
        ...task,
        shareToken: task.shareToken || this.generateShareToken(), // Ensure shareToken is preserved
        speechSequences: task.speechSequences || task.entries?.map((e: TaskEntry) => e.text) || [],
        entries: task.entries?.map((entry: TaskEntry) => ({
          ...entry,
          taskId: entry.taskId || task.id,
          audioBlob: entry.audioBlob || null,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(task.createdAt)
        })) || [],
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load baseline tasks:', error);
      return [];
    }
  }

  // Load user-created tasks from localStorage
  private loadUserTasks(userId: string): Task[] {
    try {
      const key = `eki_user_tasks_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load user tasks from localStorage:', error);
      return [];
    }
  }

  // Load deleted task IDs from localStorage
  private loadDeletedTaskIds(userId: string): string[] {
    try {
      const key = `eki_deleted_tasks_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load deleted task IDs:', error);
      return [];
    }
  }

  // Save deleted task IDs to localStorage
  private saveDeletedTaskIds(userId: string, taskIds: string[]): void {
    try {
      const key = `eki_deleted_tasks_${userId}`;
      localStorage.setItem(key, JSON.stringify(taskIds));
    } catch (error) {
      console.error('Failed to save deleted task IDs:', error);
    }
  }

  // Save user tasks to localStorage
  private saveUserTasks(userId: string, tasks: Task[]): void {
    try {
      const key = `eki_user_tasks_${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save user tasks to localStorage:', error);
    }
  }

  // Load additional entries for baseline tasks from localStorage
  private loadBaselineTaskAdditions(userId: string): Record<string, TaskEntry[]> {
    try {
      const key = `eki_baseline_additions_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load baseline task additions:', error);
      return {};
    }
  }

  // Save additional entries for baseline tasks to localStorage
  private saveBaselineTaskAdditions(userId: string, additions: Record<string, TaskEntry[]>): void {
    try {
      const key = `eki_baseline_additions_${userId}`;
      localStorage.setItem(key, JSON.stringify(additions));
    } catch (error) {
      console.error('Failed to save baseline task additions:', error);
    }
  }

  // Get all tasks for a user (baseline + user-created)
  async getUserTasks(userId: string): Promise<TaskSummary[]> {
    const [baselineTasks, userTasks, deletedTaskIds, baselineAdditions] = await Promise.all([
      this.loadBaselineTasks(),
      Promise.resolve(this.loadUserTasks(userId)),
      Promise.resolve(this.loadDeletedTaskIds(userId)),
      Promise.resolve(this.loadBaselineTaskAdditions(userId))
    ]);

    // Filter baseline tasks for this user and merge with additional entries
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

    // Filter out deleted tasks
    const activeTasks = allTasks.filter(task => !deletedTaskIds.includes(task.id));

    // Convert to TaskSummary format
    return activeTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }

  // Get user-created tasks only (for adding entries to existing tasks)
  async getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
    const userTasks = this.loadUserTasks(userId);

    // Convert to TaskSummary format
    return userTasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description ?? null,
      entryCount: task.entries?.length || 0,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  }

  // Get modifiable tasks for a user (user-created tasks only, no baseline tasks)
  async getModifiableTasks(userId: string): Promise<TaskSummary[]> {
    // For now, only return user-created tasks that can be modified
    // Baseline tasks are read-only
    return this.getUserCreatedTasks(userId);
  }

  // Get a specific task by ID
  async getTask(taskId: string, userId: string): Promise<Task | null> {
    const [baselineTasks, userTasks, baselineAdditions] = await Promise.all([
      this.loadBaselineTasks(),
      Promise.resolve(this.loadUserTasks(userId)),
      Promise.resolve(this.loadBaselineTaskAdditions(userId))
    ]);

    // Check user tasks first
    const userTask = userTasks.find(task => task.id === taskId);
    if (userTask) {
      return userTask;
    }

    // Check baseline tasks and merge with additional entries
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

  // Get a task for public/shared access (baseline tasks + shared user tasks)
  async getSharedTask(taskId: string): Promise<Task | null> {
    console.log('Getting shared task:', taskId);
    
    // First check baseline tasks
    const baselineTasks = await this.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);
    if (baselineTask) {
      console.log('Found baseline task:', baselineTask);
      return baselineTask;
    }

    // Then check shared user tasks stored in localStorage with a global key
    try {
      const sharedTasksKey = `eki_shared_tasks`;
      const stored = localStorage.getItem(sharedTasksKey);
      console.log('Shared tasks storage:', stored);
      
      if (stored) {
        const sharedTasks: Task[] = JSON.parse(stored);
        console.log('All shared tasks:', sharedTasks);
        const sharedTask = sharedTasks.find(task => task.id === taskId);
        console.log('Found shared task:', sharedTask);
        if (sharedTask) {
          return sharedTask;
        }
      }
    } catch (error) {
      console.error('Failed to load shared tasks:', error);
    }

    console.log('No shared task found for ID:', taskId);
    return null;
  }

  // Share a user task by copying it to global shared storage
  async shareUserTask(userId: string, taskId: string): Promise<void> {
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    console.log('Sharing task:', { userId, taskId, task });

    try {
      const sharedTasksKey = `eki_shared_tasks`;
      const stored = localStorage.getItem(sharedTasksKey);
      const sharedTasks: Task[] = stored ? JSON.parse(stored) : [];
      
      console.log('Current shared tasks:', sharedTasks);
      
      // Remove existing shared version if it exists
      const filteredTasks = sharedTasks.filter(t => t.id !== taskId);
      
      // Add the updated task
      filteredTasks.push(task);
      
      localStorage.setItem(sharedTasksKey, JSON.stringify(filteredTasks));
      
      console.log('Task shared successfully. New shared tasks:', filteredTasks);
    } catch (error) {
      console.error('Failed to share task:', error);
      throw new Error('Failed to share task');
    }
  }

  // Create a new task (always saved to localStorage)
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
        stressedText: entry.stressedText, // Preserve phonetic markers
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      })) || taskData.speechSequences?.map((text, index) => ({
        id: `entry_${Date.now()}_${index}`,
        taskId: '',
        text,
        stressedText: text, // Fallback for legacy speechSequences
        audioUrl: null,
        audioBlob: null,
        order: index + 1,
        createdAt: new Date()
      })) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: this.generateShareToken()
    };

    console.log('Generated new task:', newTask);

    // Update entry taskIds
    newTask.entries.forEach(entry => {
      entry.taskId = newTask.id;
    });

    // Save to localStorage
    const userTasks = this.loadUserTasks(userId);
    console.log('Existing user tasks before save:', userTasks);
    userTasks.push(newTask);
    this.saveUserTasks(userId, userTasks);
    console.log('Task saved to localStorage with key:', `eki_user_tasks_${userId}`);
    
    // Verify it was saved
    const savedTasks = this.loadUserTasks(userId);
    console.log('Tasks after save:', savedTasks);
    const savedTask = savedTasks.find(t => t.id === newTask.id);
    console.log('Newly saved task found:', savedTask);

    return newTask;
  }

  // Update a task (creates copy for baseline tasks, updates user tasks directly)
  async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const userTasks = this.loadUserTasks(userId);
    const taskIndex = userTasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      // This is a user-created task - update directly
      const existingTask = userTasks[taskIndex];
      if (!existingTask) return null;
      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date()
      };

      userTasks[taskIndex] = updatedTask;
      this.saveUserTasks(userId, userTasks);
      return updatedTask;
    }

    // Check if this is a baseline task
    const baselineTasks = await this.loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);

    if (baselineTask) {
      // Load baseline additions to merge them into the copy
      const baselineAdditions = this.loadBaselineTaskAdditions(userId);
      const additionalEntries = baselineAdditions[taskId] || [];

      // Merge baseline entries with additions before creating the copy
      const mergedEntries = [
        ...(baselineTask.entries || []),
        ...additionalEntries
      ];

      // This is a baseline task - create a copy with updates
      const taskCopy: Task = {
        ...baselineTask,
        userId, // Ensure the copy belongs to the current user
        entries: mergedEntries,
        ...updates,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        updatedAt: new Date(),
        shareToken: this.generateShareToken()
      };

      // Add the copy to user tasks
      userTasks.push(taskCopy);
      this.saveUserTasks(userId, userTasks);

      // Add original task to deleted list so only the copy shows
      const deletedTaskIds = this.loadDeletedTaskIds(userId);
      if (!deletedTaskIds.includes(taskId)) {
        deletedTaskIds.push(taskId);
        this.saveDeletedTaskIds(userId, deletedTaskIds);
      }

      // Clear baseline additions since they're now in the copied task
      if (baselineAdditions[taskId]) {
        delete baselineAdditions[taskId];
        this.saveBaselineTaskAdditions(userId, baselineAdditions);
      }

      return taskCopy;
    }

    throw new Error('Task not found');
  }

  // Delete a task (soft delete for baseline tasks, hard delete for user tasks)
  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const userTasks = this.loadUserTasks(userId);
    const taskIndex = userTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      // This is a user-created task - remove it completely
      userTasks.splice(taskIndex, 1);
      this.saveUserTasks(userId, userTasks);
      return true;
    }
    
    // Check if this is a baseline task
    const baselineTasks = await this.loadBaselineTasks();
    const isBaselineTask = baselineTasks.some(task => 
      task.id === taskId && task.userId === userId
    );
    
    if (isBaselineTask) {
      // This is a baseline task - soft delete by adding to deleted list
      const deletedTaskIds = this.loadDeletedTaskIds(userId);
      if (!deletedTaskIds.includes(taskId)) {
        deletedTaskIds.push(taskId);
        this.saveDeletedTaskIds(userId, deletedTaskIds);
      }
      return true;
    }
    
    throw new Error('Task not found');
  }

  // Add entry to task
  async addEntryToTask(userId: string, taskId: string, entryData: Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>): Promise<TaskEntry> {
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    const newEntry: TaskEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      taskId,
      ...entryData,
      createdAt: new Date()
    };

    // Update task with new entry
    const updatedEntries = [...(task.entries || []), newEntry];
    await this.updateTask(userId, taskId, { entries: updatedEntries });

    return newEntry;
  }

  // Add multiple text entries to task
  async addTextEntriesToTask(userId: string, taskId: string, textEntries: string[] | Array<{text: string; stressedText: string}>): Promise<TaskEntry[]> {
    console.log('Adding text entries to task:', { userId, taskId, textEntries });
    
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    console.log('Found task:', task);

    // Check if this is a user-created task or a baseline task
    const userTasks = this.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);
    
    console.log('Is user task:', isUserTask, 'User tasks count:', userTasks.length);
    
    // Calculate the next order number based on existing entries
    const currentEntries = task.entries || [];
    const maxOrder = currentEntries.length > 0 ? Math.max(...currentEntries.map(e => e.order)) : 0;
    
    // Create new entries
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
      // This is a user-created task - update it directly
      const updatedEntries = [...currentEntries, ...newEntries];
      await this.updateTask(userId, taskId, { 
        entries: updatedEntries,
        speechSequences: [...(task.speechSequences || []), ...textEntries.map(entry => 
          typeof entry === 'string' ? entry : entry.text
        )]
      });
    } else {
      // This is a baseline task - store additional entries separately
      const baselineAdditions = this.loadBaselineTaskAdditions(userId);
      const existingAdditions = baselineAdditions[taskId] || [];
      baselineAdditions[taskId] = [...existingAdditions, ...newEntries];
      this.saveBaselineTaskAdditions(userId, baselineAdditions);
    }

    return newEntries;
  }

  // Generate a unique share token
  private generateShareToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
  }

  // Get task by share token (for public access)
  async getTaskByShareToken(shareToken: string): Promise<Task | null> {
    console.log('Looking for share token:', shareToken);

    // First check baseline tasks
    const data = mockTasksData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baselineTask = (data.tasks as any[]).find((task) => task.shareToken === shareToken);
    if (baselineTask) {
      console.log('Found baseline task with share token:', baselineTask);
      // Normalize the task to match Task interface
      return {
        ...baselineTask,
        speechSequences: baselineTask.speechSequences || baselineTask.entries?.map((e: TaskEntry) => e.text) || [],
        entries: baselineTask.entries?.map((entry: TaskEntry) => ({
          ...entry,
          taskId: entry.taskId || baselineTask.id,
          audioBlob: entry.audioBlob || null,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(baselineTask.createdAt)
        })) || [],
        createdAt: new Date(baselineTask.createdAt),
        updatedAt: new Date(baselineTask.updatedAt)
      };
    }

    // Check global shared tasks storage
    try {
      const sharedTasksKey = 'eki_shared_tasks';
      const stored = localStorage.getItem(sharedTasksKey);
      console.log('Checking global shared tasks storage');

      if (stored) {
        const sharedTasks: Task[] = JSON.parse(stored);
        console.log('Found shared tasks:', sharedTasks.length);
        const sharedTask = sharedTasks.find(task => task.shareToken === shareToken);
        if (sharedTask) {
          console.log('Found shared task with share token:', sharedTask);
          return sharedTask;
        }
      }
    } catch (error) {
      console.error('Error searching shared tasks for share token:', error);
    }

    // Then check all user tasks in localStorage (since we don't know which user created it)
    try {
      // Get all localStorage keys that start with eki_user_tasks_
      const allUserTaskKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('eki_user_tasks_')) {
          allUserTaskKeys.push(key);
        }
      }

      console.log('Checking user task keys:', allUserTaskKeys);

      // Search through all user tasks
      for (const key of allUserTaskKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const userTasks: Task[] = JSON.parse(stored);
          const userTask = userTasks.find(task => task.shareToken === shareToken);
          if (userTask) {
            console.log('Found user task with share token:', userTask);
            return userTask;
          }
        }
      }
    } catch (error) {
      console.error('Error searching user tasks for share token:', error);
    }

    console.log('No task found with share token:', shareToken);
    return null;
  }

  // Update a specific task entry
  async updateTaskEntry(userId: string, taskId: string, entryId: string, updates: Partial<Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>>): Promise<TaskEntry | null> {
    const task = await this.getTask(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }

    const entryIndex = task.entries?.findIndex(entry => entry.id === entryId);
    if (entryIndex === undefined || entryIndex === -1) {
      throw new Error('Entry not found');
    }

    // Update the entry
    const existingEntry = task.entries?.[entryIndex];
    if (!existingEntry) throw new Error('Entry not found');
    const updatedEntry: TaskEntry = {
      ...existingEntry,
      ...updates
    };

    // Create updated entries array
    const updatedEntries = [...(task.entries ?? [])];
    updatedEntries[entryIndex] = updatedEntry;

    // Check if this is a user-created task or a baseline task
    const userTasks = this.loadUserTasks(userId);
    const isUserTask = userTasks.some(t => t.id === taskId);

    if (isUserTask) {
      // This is a user-created task - update it directly
      await this.updateTask(userId, taskId, { entries: updatedEntries });
    } else {
      // This is a baseline task - we need to handle it differently
      // For baseline tasks, we store modifications in baseline additions
      const baselineTasks = await this.loadBaselineTasks();
      const baselineTask = baselineTasks.find(task => task.id === taskId);

      if (baselineTask) {
        const baselineAdditions = this.loadBaselineTaskAdditions(userId);
        const baselineEntryCount = baselineTask.entries?.length || 0;

        if (entryIndex < baselineEntryCount) {
          // This is a baseline entry being modified - create a copy of the whole task
          await this.updateTask(userId, taskId, { entries: updatedEntries });
        } else {
          // This is an added entry - update it in baseline additions
          const additions = baselineAdditions[taskId] || [];
          const additionIndex = entryIndex - baselineEntryCount;
          if (additionIndex >= 0 && additionIndex < additions.length) {
            additions[additionIndex] = updatedEntry;
            baselineAdditions[taskId] = additions;
            this.saveBaselineTaskAdditions(userId, baselineAdditions);
          }
        }
      }
    }

    return updatedEntry;
  }
}