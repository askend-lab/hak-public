// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { TASK_STRINGS } from "@/config/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskEditDeps {
  setTaskToEdit: (task: { id: string; name: string; description?: string } | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  requireAuth: () => boolean;
}

export function useTaskEdit(deps: UseTaskEditDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { setTaskToEdit, setShowTaskEditModal, setTaskRefreshTrigger, requireAuth } = deps;

  const handleEditTask = useCallback(async (task: { id: string; name: string; description?: string | null }) => {
    if (requireAuth() || !user) {return;}
    try {
      const fullTask = await dataService.getTask(task.id);
      if (fullTask) {
        setTaskToEdit({ id: task.id, name: task.name, ...(task.description !== null && { description: task.description }) });
        setShowTaskEditModal(true);
      }
    } catch (error) { logger.error("Failed to load task:", error); }
  }, [requireAuth, user, dataService]);

  const handleTaskUpdated = useCallback(async (updatedTask: { id: string; name: string; description?: string | null }): Promise<void> => {
    if (!user) {return;}
    try {
      await dataService.updateTask(updatedTask.id, { name: updatedTask.name, ...(updatedTask.description !== null && { description: updatedTask.description }) });
      setShowTaskEditModal(false); setTaskToEdit(null); setTaskRefreshTrigger((prev) => prev + 1);
      showNotification({ type: "success", message: TASK_STRINGS.TASK_UPDATED(updatedTask.name), color: "success" });
    } catch (error) {
      logger.error("Failed to update task:", error);
      showNotification({ type: "error", message: TASK_STRINGS.TASK_UPDATE_FAILED });
    }
  }, [user, showNotification, dataService]);

  return { handleEditTask, handleTaskUpdated };
}
