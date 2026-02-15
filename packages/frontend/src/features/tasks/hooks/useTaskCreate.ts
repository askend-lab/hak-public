// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { TASK_STRINGS } from "@/config/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskCreateDeps {
  sentences: SentenceState[];
  setSelectedTaskId: (id: string | null) => void;
  setShowAddTaskModal: (show: boolean) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  setPendingSentenceId: (id: string | null) => void;
  setIsTaskCreationFromTasksView: (val: boolean) => void;
  isTaskCreationFromTasksView: boolean;
  pendingSentenceId: string | null;
  requireAuth: () => boolean;
  viewTaskAction: (taskId: string) => { label: string; onClick: () => void };
}

export function useTaskCreate(deps: UseTaskCreateDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const {
    sentences,
    setSelectedTaskId,
    setShowAddTaskModal,
    setTaskRefreshTrigger,
    setPendingSentenceId,
    setIsTaskCreationFromTasksView,
    isTaskCreationFromTasksView,
    pendingSentenceId,
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
    ],
  );

  return {
    handleCreateNewTaskFromMenu,
    handleCreateTask,
    handleAddTask,
  };
}
