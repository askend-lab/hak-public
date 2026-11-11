// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useMemo } from "react";
import { SentenceState } from "@/types/synthesis";
import { useTaskCreate } from "./useTaskCreate";
import { useTaskEdit } from "./useTaskEdit";
import { useTaskDelete } from "./useTaskDelete";

interface UseTaskCRUDDeps {
  sentences: SentenceState[];
  setSelectedTaskId: (id: string | null) => void;
  onNavigateToTasks: () => void;
  setShowAddTaskModal: (show: boolean) => void;
  setShowTaskEditModal: (show: boolean) => void;
  setShowDeleteConfirmation: (show: boolean) => void;
  setTaskToEdit: (task: { id: string; name: string; description?: string } | null) => void;
  setTaskToDelete: (task: { id: string; name: string } | null) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  setPendingSentenceId: (id: string | null) => void;
  setIsTaskCreationFromTasksView: (val: boolean) => void;
  isTaskCreationFromTasksView: boolean;
  pendingSentenceId: string | null;
  taskToDelete: { id: string; name: string } | null;
  requireAuth: () => boolean;
  viewTaskAction: (taskId: string) => { label: string; onClick: () => void };
}

export function useTaskCRUD(deps: UseTaskCRUDDeps) {
  const create = useTaskCreate({
    sentences: deps.sentences,
    setSelectedTaskId: deps.setSelectedTaskId,
    setShowAddTaskModal: deps.setShowAddTaskModal,
    setTaskRefreshTrigger: deps.setTaskRefreshTrigger,
    setPendingSentenceId: deps.setPendingSentenceId,
    setIsTaskCreationFromTasksView: deps.setIsTaskCreationFromTasksView,
    isTaskCreationFromTasksView: deps.isTaskCreationFromTasksView,
    pendingSentenceId: deps.pendingSentenceId,
    requireAuth: deps.requireAuth,
    viewTaskAction: deps.viewTaskAction,
  });

  const edit = useTaskEdit({
    setTaskToEdit: deps.setTaskToEdit,
    setShowTaskEditModal: deps.setShowTaskEditModal,
    setTaskRefreshTrigger: deps.setTaskRefreshTrigger,
    requireAuth: deps.requireAuth,
  });

  const del = useTaskDelete({
    setSelectedTaskId: deps.setSelectedTaskId,
    onNavigateToTasks: deps.onNavigateToTasks,
    setShowDeleteConfirmation: deps.setShowDeleteConfirmation,
    setTaskToDelete: deps.setTaskToDelete,
    setTaskRefreshTrigger: deps.setTaskRefreshTrigger,
    taskToDelete: deps.taskToDelete,
    requireAuth: deps.requireAuth,
  });

  return useMemo(() => ({
    handleCreateNewTaskFromMenu: create.handleCreateNewTaskFromMenu,
    handleCreateTask: create.handleCreateTask,
    handleAddTask: create.handleAddTask,
    handleEditTask: edit.handleEditTask,
    handleTaskUpdated: edit.handleTaskUpdated,
    handleDeleteTask: del.handleDeleteTask,
    handleConfirmDelete: del.handleConfirmDelete,
    handleCancelDelete: del.handleCancelDelete,
    isDeleting: del.isDeleting,
  }), [create, edit, del]);
}
