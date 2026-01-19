import { useState, useEffect } from 'react';
import { TaskSummary } from '@/types/task';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/services/auth';

interface UseUserTasksResult {
  tasks: TaskSummary[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function useUserTasks(refreshTrigger: number = 0): UseUserTasksResult {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async (): Promise<void> => {
      if (!user) {
        setTasks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const dataService = DataService.getInstance();
        const userTasks = await dataService.getUserTasks(user.id);
        setTasks(userTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Viga ülesannete laadimisel');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, refreshTrigger]);

  return {
    tasks,
    isLoading,
    error,
    isEmpty: !isLoading && tasks.length === 0
  };
}
