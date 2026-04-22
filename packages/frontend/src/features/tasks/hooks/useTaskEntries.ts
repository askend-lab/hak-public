// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { useDataService } from "@/contexts/DataServiceContext";
import { useAuth } from "@/features/auth/services";
import { useNotification } from "@/contexts/NotificationContext";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { TASK_STRINGS } from "@/config/ui-strings";
import { logger } from "@hak/shared";

interface UseTaskEntriesDeps {
  sentences: SentenceState[];
  setShowAddToTaskDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAddTaskModal: (show: boolean) => void;
  setTaskRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  requireAuth: () => boolean;
  viewTaskAction: (taskId: string) => { label: string; onClick: () => void };
}

function useBulkAdd(deps: UseTaskEntriesDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { sentences, setShowAddToTaskDropdown, setShowAddTaskModal, setTaskRefreshTrigger, requireAuth, viewTaskAction } = deps;

  const handleAddAll = useCallback(() => { if (!requireAuth()) {setShowAddToTaskDropdown((prev) => !prev);} }, [requireAuth]);
  const handleCreateNew = useCallback(() => { setShowAddTaskModal(true); }, []);

  const handleSelectTask = useCallback(async (taskId: string, taskName: string, mode: "append" | "replace") => {
    if (!user) {return;}
    const entries = filterNonEmptySentences(sentences).map((s) => ({ text: s.text, stressedText: s.phoneticText || s.text }));
    if (entries.length === 0) {return;}
    try {
      await dataService.addTextEntriesToTask(taskId, entries, mode);
      setTaskRefreshTrigger((prev) => prev + 1);
      showNotification({ type: "success", message: TASK_STRINGS.ADDED_TO_TASK, description: TASK_STRINGS.ADDED_ENTRIES(entries.length, taskName), action: viewTaskAction(taskId) });
    } catch (error) { logger.error("Failed to add entries:", error); showNotification({ type: "error", message: TASK_STRINGS.ADD_ENTRIES_FAILED }); }
  }, [user, sentences, showNotification, viewTaskAction, dataService]);

  return { handleAddAll, handleCreateNew, handleSelectTask };
}

export function useTaskEntries(deps: UseTaskEntriesDeps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const dataService = useDataService();
  const { sentences, setTaskRefreshTrigger, viewTaskAction } = deps;
  const bulk = useBulkAdd(deps);

  const handleAddSentenceToExistingTask = useCallback(async (sentenceId: string, taskId: string, taskName: string) => {
    if (!user) {return;}
    const sentence = sentences.find((s) => s.id === sentenceId);
    if (!sentence || !sentence.text.trim()) {return;}
    try {
      await dataService.addTextEntriesToTask(taskId, [{ text: sentence.text, stressedText: sentence.phoneticText || sentence.text }]);
      setTaskRefreshTrigger((prev) => prev + 1);
      showNotification({ type: "success", message: TASK_STRINGS.ADDED_TO_TASK, description: TASK_STRINGS.ADDED_ENTRY(taskName), action: viewTaskAction(taskId) });
    } catch (error) { logger.error("Failed to add entry:", error); showNotification({ type: "error", message: TASK_STRINGS.ADD_ENTRIES_FAILED }); }
  }, [user, sentences, showNotification, viewTaskAction, dataService]);

  return {
    handleAddAllSentencesToTask: bulk.handleAddAll, handleSelectTaskFromDropdown: bulk.handleSelectTask,
    handleCreateNewFromDropdown: bulk.handleCreateNew, handleAddSentenceToExistingTask,
  };
}
