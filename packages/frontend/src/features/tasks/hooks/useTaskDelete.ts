// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { TASK_STRINGS } from "@/config/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskDeleteDeps {
  setSelectedTaskId: (id: string | null) => void;
  onNavigateToTasks: () => void;
  setShowDeleteConfirmation: (show: boolean) => void;
  setTaskToDelete: (task: { id: string; name: string } | null) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  taskToDelete: { id: string; name: string } | null;
  requireAuth: () => boolean;
}

export function useTaskDelete(deps: UseTaskDeleteDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const [isDeleting, setIsDeleting] = useState(false);
  const { setSelectedTaskId, onNavigateToTasks, setShowDeleteConfirmation, setTaskToDelete, setTaskRefreshTrigger, taskToDelete, requireAuth } = deps;

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (requireAuth() || !user) {return;}
    try {
      const fullTask = await dataService.getTask(taskId);
      if (fullTask) { setTaskToDelete({ id: taskId, name: fullTask.name }); setShowDeleteConfirmation(true); }
    } catch (error) { logger.error("Failed to load task:", error); }
  }, [requireAuth, user, dataService]);

  const handleConfirmDelete = useCallback(async () => {
    if (!user || !taskToDelete) {return;}
    setIsDeleting(true);
    try {
      await dataService.deleteTask(taskToDelete.id);
      setTaskRefreshTrigger((prev) => prev + 1);
      showNotification({ type: "success", message: TASK_STRINGS.TASK_DELETED(taskToDelete.name), color: "success" });
      setSelectedTaskId(null); onNavigateToTasks();
    } catch (error) {
      logger.error("Failed to delete task:", error);
      showNotification({ type: "error", message: TASK_STRINGS.TASK_DELETE_FAILED });
    } finally { setIsDeleting(false); setShowDeleteConfirmation(false); setTaskToDelete(null); }
  }, [user, taskToDelete, showNotification, setSelectedTaskId, onNavigateToTasks, dataService]);

  const handleCancelDelete = useCallback(() => { setShowDeleteConfirmation(false); setTaskToDelete(null); }, []);

  return { handleDeleteTask, handleConfirmDelete, handleCancelDelete, isDeleting };
}
