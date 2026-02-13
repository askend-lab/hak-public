// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { DataService } from "@/services/dataService";
import { useAuth } from "@/services/auth";
import { useNotification } from "@/contexts/NotificationContext";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { TASK_STRINGS } from "@/constants/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskEntriesDeps {
  sentences: SentenceState[];
  setShowAddToTaskDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddTaskModal: (show: boolean) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  requireAuth: () => boolean;
  viewTaskAction: (taskId: string) => { label: string; onClick: () => void };
}

export function useTaskEntries(deps: UseTaskEntriesDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const {
    sentences,
    setShowAddToTaskDropdown,
    setShowAddTaskModal,
    setTaskRefreshTrigger,
    requireAuth,
    viewTaskAction,
  } = deps;

  const handleAddAllSentencesToTask = useCallback(() => {
    if (requireAuth()) return;
    setShowAddToTaskDropdown((prev) => !prev);
  }, [requireAuth]);

  const handleSelectTaskFromDropdown = useCallback(
    async (taskId: string, taskName: string) => {
      if (!user) return;
      const entries = filterNonEmptySentences(sentences).map((s) => ({
        text: s.text,
        stressedText: s.phoneticText || s.text,
      }));
      if (entries.length === 0) return;

      try {
        const dataService = DataService.getInstance();
        await dataService.addTextEntriesToTask(user.id, taskId, entries);
        setTaskRefreshTrigger((prev) => prev + 1);
        const count = entries.length;
        showNotification(
          "success",
          TASK_STRINGS.ADDED_TO_TASK,
          TASK_STRINGS.ADDED_ENTRIES(count, taskName),
          undefined,
          undefined,
          viewTaskAction(taskId),
        );
      } catch (error) {
        logger.error("Failed to add entries:", error);
        showNotification("error", TASK_STRINGS.ADD_ENTRIES_FAILED);
      }
    },
    [user, sentences, showNotification, viewTaskAction],
  );

  const handleCreateNewFromDropdown = useCallback(() => {
    setShowAddTaskModal(true);
  }, []);

  const handleAddSentenceToExistingTask = useCallback(
    async (sentenceId: string, taskId: string, taskName: string) => {
      if (!user) return;
      const sentence = sentences.find((s) => s.id === sentenceId);
      if (!sentence || !sentence.text.trim()) return;

      try {
        const dataService = DataService.getInstance();
        await dataService.addTextEntriesToTask(user.id, taskId, [
          {
            text: sentence.text,
            stressedText: sentence.phoneticText || sentence.text,
          },
        ]);
        setTaskRefreshTrigger((prev) => prev + 1);
        showNotification(
          "success",
          TASK_STRINGS.ADDED_TO_TASK,
          TASK_STRINGS.ADDED_ENTRY(taskName),
          undefined,
          undefined,
          viewTaskAction(taskId),
        );
      } catch (error) {
        logger.error("Failed to add entry:", error);
        showNotification("error", TASK_STRINGS.ADD_ENTRIES_FAILED);
      }
    },
    [user, sentences, showNotification, viewTaskAction],
  );

  return {
    handleAddAllSentencesToTask,
    handleSelectTaskFromDropdown,
    handleCreateNewFromDropdown,
    handleAddSentenceToExistingTask,
  };
}
