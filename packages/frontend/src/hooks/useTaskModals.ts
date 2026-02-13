// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState } from "react";

export function useTaskModals() {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddToTaskDropdown, setShowAddToTaskDropdown] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [showShareTaskModal, setShowShareTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<{
    id: string;
    name: string;
    description?: string | null;
  } | null>(null);
  const [taskToShare, setTaskToShare] = useState<{
    id: string;
    shareToken?: string;
    name: string;
  } | null>(null);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [pendingSentenceId, setPendingSentenceId] = useState<string | null>(
    null,
  );
  const [isTaskCreationFromTasksView, setIsTaskCreationFromTasksView] =
    useState(false);

  return {
    showAddTaskModal,
    setShowAddTaskModal,
    showAddToTaskDropdown,
    setShowAddToTaskDropdown,
    showTaskEditModal,
    setShowTaskEditModal,
    showShareTaskModal,
    setShowShareTaskModal,
    taskToEdit,
    setTaskToEdit,
    taskToShare,
    setTaskToShare,
    taskRefreshTrigger,
    setTaskRefreshTrigger,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    taskToDelete,
    setTaskToDelete,
    pendingSentenceId,
    setPendingSentenceId,
    isTaskCreationFromTasksView,
    setIsTaskCreationFromTasksView,
  };
}
