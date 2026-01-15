/* eslint-disable max-lines-per-function, max-lines */
import { Task, TaskEntry, CreateTaskRequest } from '@/types/task';
import { loadBaselineTasks, loadUserTasks, loadDeletedTaskIds, loadBaselineTaskAdditions, saveUserTasks, saveDeletedTaskIds, saveBaselineTaskAdditions, loadSharedTasks, generateShareToken } from './storage';
import { getTask } from './queries';

export async function shareUserTask(userId: string, taskId: string): Promise<void> {
  const task = await getTask(taskId, userId);
  if (!task) throw new Error('Task not found');

  console.log('Sharing task:', { userId, taskId, task });

  try {
    const sharedTasks = loadSharedTasks();
    const filteredTasks = sharedTasks.filter(t => t.id !== taskId);
    filteredTasks.push(task);
    localStorage.setItem('eki_shared_tasks', JSON.stringify(filteredTasks));
    console.log('Task shared successfully. New shared tasks:', filteredTasks);
  } catch (error) {
    console.error('Failed to share task:', error);
    throw new Error('Failed to share task');
  }
}

export async function createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
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
    shareToken: generateShareToken()
  };

  newTask.entries.forEach(entry => { entry.taskId = newTask.id; });

  const userTasks = loadUserTasks(userId);
  userTasks.push(newTask);
  saveUserTasks(userId, userTasks);
  console.log('Task saved to localStorage with key:', `eki_user_tasks_${userId}`);

  return newTask;
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<Task | null> {
  const userTasks = loadUserTasks(userId);
  const taskIndex = userTasks.findIndex(task => task.id === taskId);

  if (taskIndex !== -1) {
    const existingTask = userTasks[taskIndex];
    if (!existingTask) return null;
    const updatedTask: Task = { ...existingTask, ...updates, updatedAt: new Date() };
    userTasks[taskIndex] = updatedTask;
    saveUserTasks(userId, userTasks);
    return updatedTask;
  }

  const baselineTasks = await loadBaselineTasks();
  const baselineTask = baselineTasks.find(task => task.id === taskId);

  if (baselineTask) {
    const baselineAdditions = loadBaselineTaskAdditions(userId);
    const additionalEntries = baselineAdditions[taskId] || [];
    const mergedEntries = [...(baselineTask.entries || []), ...additionalEntries];

    const taskCopy: Task = {
      ...baselineTask,
      userId,
      entries: mergedEntries,
      ...updates,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      updatedAt: new Date(),
      shareToken: generateShareToken()
    };

    userTasks.push(taskCopy);
    saveUserTasks(userId, userTasks);

    const deletedTaskIds = loadDeletedTaskIds(userId);
    if (!deletedTaskIds.includes(taskId)) {
      deletedTaskIds.push(taskId);
      saveDeletedTaskIds(userId, deletedTaskIds);
    }

    if (baselineAdditions[taskId]) {
      delete baselineAdditions[taskId];
      saveBaselineTaskAdditions(userId, baselineAdditions);
    }

    return taskCopy;
  }

  throw new Error('Task not found');
}

export async function deleteTask(userId: string, taskId: string): Promise<boolean> {
  const userTasks = loadUserTasks(userId);
  const taskIndex = userTasks.findIndex(task => task.id === taskId);
  
  if (taskIndex !== -1) {
    userTasks.splice(taskIndex, 1);
    saveUserTasks(userId, userTasks);
    return true;
  }
  
  const baselineTasks = await loadBaselineTasks();
  const isBaselineTask = baselineTasks.some(task => task.id === taskId && task.userId === userId);
  
  if (isBaselineTask) {
    const deletedTaskIds = loadDeletedTaskIds(userId);
    if (!deletedTaskIds.includes(taskId)) {
      deletedTaskIds.push(taskId);
      saveDeletedTaskIds(userId, deletedTaskIds);
    }
    return true;
  }
  
  throw new Error('Task not found');
}

export async function addEntryToTask(userId: string, taskId: string, entryData: Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>): Promise<TaskEntry> {
  const task = await getTask(taskId, userId);
  if (!task) throw new Error('Task not found');

  const newEntry: TaskEntry = {
    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    taskId,
    ...entryData,
    createdAt: new Date()
  };

  const updatedEntries = [...(task.entries || []), newEntry];
  await updateTask(userId, taskId, { entries: updatedEntries });

  return newEntry;
}

export async function addTextEntriesToTask(userId: string, taskId: string, textEntries: string[] | Array<{text: string; stressedText: string}>): Promise<TaskEntry[]> {
  console.log('Adding text entries to task:', { userId, taskId, textEntries });
  
  const task = await getTask(taskId, userId);
  if (!task) throw new Error('Task not found');

  const userTasks = loadUserTasks(userId);
  const isUserTask = userTasks.some(t => t.id === taskId);
  
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
    await updateTask(userId, taskId, { 
      entries: updatedEntries,
      speechSequences: [...(task.speechSequences || []), ...textEntries.map(entry => typeof entry === 'string' ? entry : entry.text)]
    });
  } else {
    const baselineAdditions = loadBaselineTaskAdditions(userId);
    const existingAdditions = baselineAdditions[taskId] || [];
    baselineAdditions[taskId] = [...existingAdditions, ...newEntries];
    saveBaselineTaskAdditions(userId, baselineAdditions);
  }

  return newEntries;
}

export async function updateTaskEntry(userId: string, taskId: string, entryId: string, updates: Partial<Omit<TaskEntry, 'id' | 'taskId' | 'createdAt'>>): Promise<TaskEntry | null> {
  const task = await getTask(taskId, userId);
  if (!task) throw new Error('Task not found');

  const entryIndex = task.entries?.findIndex(entry => entry.id === entryId);
  if (entryIndex === undefined || entryIndex === -1) throw new Error('Entry not found');

  const existingEntry = task.entries?.[entryIndex];
  if (!existingEntry) throw new Error('Entry not found');
  const updatedEntry: TaskEntry = { ...existingEntry, ...updates };

  const updatedEntries = [...(task.entries ?? [])];
  updatedEntries[entryIndex] = updatedEntry;

  const userTasks = loadUserTasks(userId);
  const isUserTask = userTasks.some(t => t.id === taskId);

  if (isUserTask) {
    await updateTask(userId, taskId, { entries: updatedEntries });
  } else {
    const baselineTasks = await loadBaselineTasks();
    const baselineTask = baselineTasks.find(task => task.id === taskId);

    if (baselineTask) {
      const baselineAdditions = loadBaselineTaskAdditions(userId);
      const baselineEntryCount = baselineTask.entries?.length || 0;

      if (entryIndex < baselineEntryCount) {
        await updateTask(userId, taskId, { entries: updatedEntries });
      } else {
        const additions = baselineAdditions[taskId] || [];
        const additionIndex = entryIndex - baselineEntryCount;
        if (additionIndex >= 0 && additionIndex < additions.length) {
          additions[additionIndex] = updatedEntry;
          baselineAdditions[taskId] = additions;
          saveBaselineTaskAdditions(userId, baselineAdditions);
        }
      }
    }
  }

  return updatedEntry;
}
