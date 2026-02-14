// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useAuth } from "@/features/auth/services";
import { SentenceState } from "@/types/synthesis";
import { TASK_STRINGS } from "@/constants/ui-strings";
import { useTaskModals } from "./useTaskModals";
import { useTaskCRUD } from "./useTaskCRUD";
import { useTaskEntries } from "./useTaskEntries";
import { useTaskSharing } from "@/features/sharing/hooks/useTaskSharing";

export function useTaskHandlers(
  sentences: SentenceState[],
  setCurrentView: (view: "synthesis" | "tasks") => void,
  setSelectedTaskId: (id: string | null) => void = () => {},
) {
  const { isAuthenticated, setShowLoginModal } = useAuth();

  const modals = useTaskModals();

  // Auth guard helper - returns true if NOT authenticated (to trigger early return)
  const requireAuth = useCallback((): boolean => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return true;
    }
    return false;
  }, [isAuthenticated, setShowLoginModal]);

  // Navigation action for notifications - navigates to task view
  const viewTaskAction = useCallback(
    (taskId: string): { label: string; onClick: () => void } => ({
      label: TASK_STRINGS.VIEW_TASK,
      onClick: (): void => {
        setSelectedTaskId(taskId);
        setCurrentView("tasks");
      },
    }),
    [setSelectedTaskId, setCurrentView],
  );

  const crud = useTaskCRUD({
    sentences,
    setSelectedTaskId,
    setCurrentView,
    setShowAddTaskModal: modals.setShowAddTaskModal,
    setShowTaskEditModal: modals.setShowTaskEditModal,
    setShowDeleteConfirmation: modals.setShowDeleteConfirmation,
    setTaskToEdit: modals.setTaskToEdit,
    setTaskToDelete: modals.setTaskToDelete,
    setTaskRefreshTrigger: modals.setTaskRefreshTrigger,
    setPendingSentenceId: modals.setPendingSentenceId,
    setIsTaskCreationFromTasksView: modals.setIsTaskCreationFromTasksView,
    isTaskCreationFromTasksView: modals.isTaskCreationFromTasksView,
    pendingSentenceId: modals.pendingSentenceId,
    taskToDelete: modals.taskToDelete,
    requireAuth,
    viewTaskAction,
  });

  const entries = useTaskEntries({
    sentences,
    setShowAddToTaskDropdown: modals.setShowAddToTaskDropdown,
    setShowAddTaskModal: modals.setShowAddTaskModal,
    setTaskRefreshTrigger: modals.setTaskRefreshTrigger,
    requireAuth,
    viewTaskAction,
  });

  const sharing = useTaskSharing({
    setShowShareTaskModal: modals.setShowShareTaskModal,
    setTaskToShare: modals.setTaskToShare,
    requireAuth,
  });

  return {
    ...modals,
    ...crud,
    ...entries,
    ...sharing,
  };
}
