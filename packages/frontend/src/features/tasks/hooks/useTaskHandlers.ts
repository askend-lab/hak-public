// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useAuth } from "@/features/auth/services";
import { SentenceState } from "@/types/synthesis";
import { TASK_STRINGS } from "@/config/ui-strings";
import { useTaskModals } from "./useTaskModals";
import { useTaskCRUD } from "./useTaskCRUD";
import { useTaskEntries } from "./useTaskEntries";
import { useTaskSharing } from "@/features/sharing/hooks/useTaskSharing";

function useAuthGuard() {
  const { isAuthenticated, setShowLoginModal } = useAuth();
  return useCallback((): boolean => {
    if (!isAuthenticated) { setShowLoginModal(true); return true; }
    return false;
  }, [isAuthenticated, setShowLoginModal]);
}

export function useTaskHandlers(sentences: SentenceState[], onNavigateToTasks: () => void, setSelectedTaskId: (id: string | null) => void = () => {}) {
  const modals = useTaskModals();
  const requireAuth = useAuthGuard();
  const viewTaskAction = useCallback(
    (taskId: string) => ({ label: TASK_STRINGS.VIEW_TASK, onClick: () => { setSelectedTaskId(taskId); onNavigateToTasks(); } }),
    [setSelectedTaskId, onNavigateToTasks],
  );

  const crud = useTaskCRUD({
    sentences, setSelectedTaskId, onNavigateToTasks,
    setShowAddTaskModal: modals.setShowAddTaskModal, setShowTaskEditModal: modals.setShowTaskEditModal,
    setShowDeleteConfirmation: modals.setShowDeleteConfirmation, setTaskToEdit: modals.setTaskToEdit,
    setTaskToDelete: modals.setTaskToDelete, setTaskRefreshTrigger: modals.setTaskRefreshTrigger,
    setPendingSentenceId: modals.setPendingSentenceId, setIsTaskCreationFromTasksView: modals.setIsTaskCreationFromTasksView,
    isTaskCreationFromTasksView: modals.isTaskCreationFromTasksView, pendingSentenceId: modals.pendingSentenceId,
    taskToDelete: modals.taskToDelete, requireAuth, viewTaskAction,
  });
  const entries = useTaskEntries({
    sentences, setShowAddToTaskDropdown: modals.setShowAddToTaskDropdown, setShowAddTaskModal: modals.setShowAddTaskModal,
    setTaskRefreshTrigger: modals.setTaskRefreshTrigger, requireAuth, viewTaskAction,
  });
  const sharing = useTaskSharing({ setShowShareTaskModal: modals.setShowShareTaskModal, setTaskToShare: modals.setTaskToShare, requireAuth });

  return { modals, crud, entries, sharing };
}
