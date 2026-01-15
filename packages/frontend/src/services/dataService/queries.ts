import { Task, TaskSummary, TaskEntry } from '@/types/task';
import mockTasksData from '../../../public/data/mock-tasks.json';
import { loadBaselineTasks, loadUserTasks, loadDeletedTaskIds, loadBaselineTaskAdditions, loadSharedTasks } from './storage';

export async function getUserTasks(userId: string): Promise<TaskSummary[]> {
  const [baselineTasks, userTasks, deletedTaskIds, baselineAdditions] = await Promise.all([
    loadBaselineTasks(),
    Promise.resolve(loadUserTasks(userId)),
    Promise.resolve(loadDeletedTaskIds(userId)),
    Promise.resolve(loadBaselineTaskAdditions(userId))
  ]);

  const userBaselineTasks = baselineTasks
    .filter(task => task.userId === userId)
    .map(task => ({
      ...task,
      entries: [...(task.entries || []), ...(baselineAdditions[task.id] || [])]
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

export async function getUserCreatedTasks(userId: string): Promise<TaskSummary[]> {
  const userTasks = loadUserTasks(userId);
  return userTasks.map(task => ({
    id: task.id,
    name: task.name,
    description: task.description ?? null,
    entryCount: task.entries?.length || 0,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt)
  }));
}

export async function getModifiableTasks(userId: string): Promise<TaskSummary[]> {
  return getUserCreatedTasks(userId);
}

export async function getTask(taskId: string, userId: string): Promise<Task | null> {
  const [baselineTasks, userTasks, baselineAdditions] = await Promise.all([
    loadBaselineTasks(),
    Promise.resolve(loadUserTasks(userId)),
    Promise.resolve(loadBaselineTaskAdditions(userId))
  ]);

  const userTask = userTasks.find(task => task.id === taskId);
  if (userTask) return userTask;

  const baselineTask = baselineTasks.find(task => task.id === taskId);
  if (baselineTask) {
    return {
      ...baselineTask,
      entries: [...(baselineTask.entries || []), ...(baselineAdditions[taskId] || [])]
    };
  }

  return null;
}

export async function getSharedTask(taskId: string): Promise<Task | null> {
  console.log('Getting shared task:', taskId);
  
  const baselineTasks = await loadBaselineTasks();
  const baselineTask = baselineTasks.find(task => task.id === taskId);
  if (baselineTask) {
    console.log('Found baseline task:', baselineTask);
    return baselineTask;
  }

  const sharedTasks = loadSharedTasks();
  console.log('Shared tasks storage:', sharedTasks);
  const sharedTask = sharedTasks.find(task => task.id === taskId);
  if (sharedTask) {
    console.log('Found shared task:', sharedTask);
    return sharedTask;
  }

  console.log('No shared task found for ID:', taskId);
  return null;
}

/* eslint-disable max-lines-per-function */
export async function getTaskByShareToken(shareToken: string): Promise<Task | null> {
  console.log('Looking for share token:', shareToken);

  const data = mockTasksData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baselineTask = (data.tasks as any[]).find((task) => task.shareToken === shareToken);
  if (baselineTask) {
    console.log('Found baseline task with share token:', baselineTask);
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

  const sharedTasks = loadSharedTasks();
  const sharedTask = sharedTasks.find(task => task.shareToken === shareToken);
  if (sharedTask) {
    console.log('Found shared task with share token:', sharedTask);
    return sharedTask;
  }

  try {
    const allUserTaskKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eki_user_tasks_')) {
        allUserTaskKeys.push(key);
      }
    }

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
