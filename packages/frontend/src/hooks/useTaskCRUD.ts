// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { DataService } from "@/services/dataService";
import { useAuth } from "@/services/auth";
import { useNotification } from "@/contexts/NotificationContext";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { TASK_STRINGS } from "@/constants/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskCRUDDeps {
  sentences: SentenceState[];
  setSelectedTaskId: (id: string | null) => void;
  setCurrentView: (view: "synthesis" | "tasks") => void;
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
  const {
    sentences,
    setSelectedTaskId,
    setCurrentView,
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
        const dataService = DataService.getInstance();
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
          showNotification(
            "success",
            TASK_STRINGS.TASK_CREATED,
            TASK_STRINGS.TASK_CREATED_DETAIL(title),
            undefined,
            undefined,
            viewTaskAction(newTask.id),
          );
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
      setCurrentView,
    ],
  );

  const handleEditTask = useCallback(
    async (task: { id: string; name: string; description?: string | null }) => {
      if (requireAuth()) return;
      if (!user) return;
      try {
        const dataService = DataService.getInstance();
        const fullTask = await dataService.getTask(task.id, user.id);
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
    [requireAuth, user],
  );

  const handleTaskUpdated = useCallback(
    async (updatedTask: {
      id: string;
      name: string;
      description?: string | null;
    }): Promise<void> => {
      if (!user) return;
      try {
        const dataService = DataService.getInstance();
        await dataService.updateTask(user.id, updatedTask.id, {
          name: updatedTask.name,
          ...(updatedTask.description !== null && {
            description: updatedTask.description,
          }),
        });
        setShowTaskEditModal(false);
        setTaskToEdit(null);
        setTaskRefreshTrigger((prev) => prev + 1);
        showNotification(
          "success",
          TASK_STRINGS.TASK_UPDATED(updatedTask.name),
          undefined,
          undefined,
          "success",
        );
      } catch (error) {
        logger.error("Failed to update task:", error);
        showNotification("error", TASK_STRINGS.TASK_UPDATE_FAILED);
      }
    },
    [user, showNotification],
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (requireAuth()) return;
      if (!user) return;
      try {
        const dataService = DataService.getInstance();
        const fullTask = await dataService.getTask(taskId, user.id);
        if (fullTask) {
          setTaskToDelete({ id: taskId, name: fullTask.name });
          setShowDeleteConfirmation(true);
        }
      } catch (error) {
        logger.error("Failed to load task:", error);
      }
    },
    [requireAuth, user],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!user || !taskToDelete) return;
    const taskName = taskToDelete.name;
    try {
      const dataService = DataService.getInstance();
      await dataService.deleteTask(user.id, taskToDelete.id);
      setTaskRefreshTrigger((prev) => prev + 1);
      showNotification(
        "success",
        TASK_STRINGS.TASK_DELETED(taskName),
        undefined,
        undefined,
        "success",
      );
      setSelectedTaskId(null);
      setCurrentView("tasks");
    } catch (error) {
      logger.error("Failed to delete task:", error);
      showNotification("error", TASK_STRINGS.TASK_DELETE_FAILED);
    } finally {
      setShowDeleteConfirmation(false);
      setTaskToDelete(null);
    }
  }, [user, taskToDelete, showNotification, setSelectedTaskId, setCurrentView]);

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
  };
}
