import { create } from 'zustand';

import type { Task } from '../../core/schemas';

interface TasksState {
  tasks: Task[];
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface TasksActions {
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  selectTask: (taskId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: TasksState = {
  tasks: [],
  selectedTaskId: null,
  isLoading: false,
  error: null,
};

export const useTasksStore = create<TasksState & TasksActions>((set) => ({
  ...initialState,
  setTasks: (tasks): void => { set({ tasks }); },
  addTask: (task): void => { set((state) => ({ tasks: [...state.tasks, task] })); },
  updateTask: (taskId, updates): void =>
    { set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })); },
  removeTask: (taskId): void =>
    { set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })); },
  selectTask: (taskId): void => { set({ selectedTaskId: taskId }); },
  setLoading: (isLoading): void => { set({ isLoading }); },
  setError: (error): void => { set({ error }); },
  reset: (): void => { set(initialState); },
}));

export const getSelectedTask = (state: TasksState): Task | null => {
  if (state.selectedTaskId === null) return null;
  return state.tasks.find((t) => t.id === state.selectedTaskId) ?? null;
};
