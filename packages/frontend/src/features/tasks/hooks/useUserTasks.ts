// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect } from "react";
import { TaskSummary } from "@/types/task";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";

interface UseUserTasksResult {
  tasks: TaskSummary[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function useUserTasks(refreshTrigger: number = 0): UseUserTasksResult {
  const { user } = useAuth();
  const dataService = useDataService();
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
        const userTasks = await dataService.getUserTasks();
        setTasks(userTasks);
      } catch (err) {
        setError(
          getErrorMessage(err, "Viga ülesannete laadimisel"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTasks();
  }, [user, refreshTrigger, dataService]);

  return {
    tasks,
    isLoading,
    error,
    isEmpty: !isLoading && tasks.length === 0,
  };
}
