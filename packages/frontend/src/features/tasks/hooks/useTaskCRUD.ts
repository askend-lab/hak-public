// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { TASK_STRINGS } from "@/config/ui-strings";
import { logger } from "@hak/shared";

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
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    sentences,
    setSelectedTaskId,
    onNavigateToTasks,
    setShowAddTaskModal,
    setShowTaskEditModal,
    setShowDeleteConfirmation,
    setTaskToEdit,
    setTaskToDelete,
    setTaskRefreshTrigger,
    setPendingSentenceId,
    setIsTaskCreationFromTasksView,
    isTaskCreationFromTasksView,
    pendingSentenceId,
    taskToDelete,
    requireAuth,
    viewTaskAction,
  } = deps;

  const handleCreateNewTaskFromMenu = useCallback(
    (sentenceId: string) => {
      if (requireAuth()) return;
      setPendingSentenceId(sentenceId);
      setShowAddTaskModal(true);
    },
    [requireAuth],
  );

  const handleCreateTask = useCallback(() => {
    if (requireAuth()) return;
    setIsTaskCreationFromTasksView(true);
    setShowAddTaskModal(true);
  }, [requireAuth]);

  const handleAddTask = useCallback(
    async (title: string, description: string) => {
      if (!user) return;
      try {
        const entriesToAdd = isTaskCreationFromTasksView
          ? []
          : pendingSentenceId
            ? sentences.filter(
                (s) => s.id === pendingSentenceId && s.text.trim(),
              )
            : filterNonEmptySentences(sentences);
        const playlistEntries = entriesToAdd.map((s) => ({
          text: s.text,
          stressedText: s.phoneticText || s.text,
        }));
        const newTask = await dataService.createTask(user.id, {
          name: title,
          description: description || null,
          speechSequences: playlistEntries.map((e) => e.text),
          speechEntries: playlistEntries.length > 0 ? playlistEntries : null,
        });
        setShowAddTaskModal(false);
        setPendingSentenceId(null);
        setIsTaskCreationFromTasksView(false);
        setTaskRefreshTrigger((prev) => prev + 1);
        if (playlistEntries.length > 0) {
          showNotification({
            type: "success",
            message: TASK_STRINGS.TASK_CREATED,
            description: TASK_STRINGS.TASK_CREATED_DETAIL(title),
            action: viewTaskAction(newTask.id),
          });
        }
        setSelectedTaskId(newTask.id);
      } catch (error) {
        logger.error("Failed to create task:", error);
        throw error;
      }
    },
    [
      user,
      sentences,
      pendingSentenceId,
      isTaskCreationFromTasksView,
      showNotification,
      setSelectedTaskId,
      onNavigateToTasks,
    ],
  );

  const handleEditTask = useCallback(
    async (task: { id: string; name: string; description?: string | null }) => {
      if (requireAuth()) return;
      if (!user) return;
      try {
        const fullTask = await dataService.getTask(task.id);
        if (fullTask) {
          setTaskToEdit({
            id: task.id,
            name: task.name,
            ...(task.description !== null && { description: task.description }),
          });
          setShowTaskEditModal(true);
        }
      } catch (error) {
        logger.error("Failed to load task:", error);
      }
    },
    [requireAuth, user, dataService],
  );

  const handleTaskUpdated = useCallback(
    async (updatedTask: {
      id: string;
      name: string;
      description?: string | null;
    }): Promise<void> => {
      if (!user) return;
      try {
        await dataService.updateTask(updatedTask.id, {
          name: updatedTask.name,
          ...(updatedTask.description !== null && {
            description: updatedTask.description,
          }),
        });
        setShowTaskEditModal(false);
        setTaskToEdit(null);
        setTaskRefreshTrigger((prev) => prev + 1);
        showNotification({
          type: "success",
          message: TASK_STRINGS.TASK_UPDATED(updatedTask.name),
          color: "success",
        });
      } catch (error) {
        logger.error("Failed to update task:", error);
        showNotification({ type: "error", message: TASK_STRINGS.TASK_UPDATE_FAILED });
      }
    },
    [user, showNotification, dataService],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (requireAuth()) return;
      if (!user) return;
      try {
        const fullTask = await dataService.getTask(taskId);
        if (fullTask) {
          setTaskToDelete({ id: taskId, name: fullTask.name });
          setShowDeleteConfirmation(true);
        }
      } catch (error) {
        logger.error("Failed to load task:", error);
      }
    },
    [requireAuth, user, dataService],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!user || !taskToDelete) return;
    setIsDeleting(true);
    const taskName = taskToDelete.name;
    try {
      await dataService.deleteTask(taskToDelete.id);
      setTaskRefreshTrigger((prev) => prev + 1);
      showNotification({
        type: "success",
        message: TASK_STRINGS.TASK_DELETED(taskName),
        color: "success",
      });
      setSelectedTaskId(null);
      onNavigateToTasks();
    } catch (error) {
      logger.error("Failed to delete task:", error);
      showNotification({ type: "error", message: TASK_STRINGS.TASK_DELETE_FAILED });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      setTaskToDelete(null);
    }
  }, [user, taskToDelete, showNotification, setSelectedTaskId, onNavigateToTasks, dataService]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  }, []);

  return {
    handleCreateNewTaskFromMenu,
    handleCreateTask,
    handleAddTask,
    handleEditTask,
    handleTaskUpdated,
    handleDeleteTask,
    handleConfirmDelete,
    handleCancelDelete,
    isDeleting,
  };
}
