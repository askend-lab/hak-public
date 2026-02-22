// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { stripPhoneticMarkers } from "@/features/synthesis/utils/phoneticMarkers";
import { analyzeText } from "@/features/synthesis/utils/analyzeApi";
import { logger } from "@hak/shared";

interface UsePhoneticPanelReturn {
  showPhoneticPanel: boolean;
  phoneticPanelEntryId: string | null;
  handleExplorePhonetic: (entryId: string) => Promise<void>;
  handleClosePhoneticPanel: () => void;
  handlePhoneticApply: (newPhoneticText: string) => Promise<void>;
}

export function usePhoneticPanel(
  entries: TaskEntry[],
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>,
  task: Task | null,
  userId: string | undefined,
  onMenuClose: () => void,
): UsePhoneticPanelReturn {
  const dataService = useDataService();
  const [showPhoneticPanel, setShowPhoneticPanel] = useState(false);
  const [phoneticPanelEntryId, setPhoneticPanelEntryId] = useState<
    string | null
  >(null);

  const handleExplorePhonetic = useCallback(
    async (entryId: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry || !entry.text.trim()) {return;}

      onMenuClose();

      if (!entry.stressedText) {
        const stressedText = await analyzeText(entry.text);
        if (stressedText) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, stressedText } : e,
            ),
          );
        }
      }

      setPhoneticPanelEntryId(entryId);
      setShowPhoneticPanel(true);
    },
    [entries, setEntries, onMenuClose],
  );

  const handleClosePhoneticPanel = useCallback(() => {
    setShowPhoneticPanel(false);
    setPhoneticPanelEntryId(null);
  }, []);

  const handlePhoneticApply = useCallback(
    async (newPhoneticText: string) => {
      if (!phoneticPanelEntryId || !task || !userId) {
        handleClosePhoneticPanel();
        return;
      }

      const newPlainText = stripPhoneticMarkers(newPhoneticText) || "";

      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === phoneticPanelEntryId) {
            return {
              ...entry,
              text: newPlainText,
              stressedText: newPhoneticText,
              audioUrl: null,
              audioBlob: null,
            };
          }
          return entry;
        }),
      );

      handleClosePhoneticPanel();

      try {
        await dataService.updateTaskEntry(
          task.id,
          phoneticPanelEntryId,
          {
            text: newPlainText,
            stressedText: newPhoneticText,
          },
        );
      } catch (error) {
        logger.error("Failed to update entry:", error);
        alert("Viga: häälduskuju salvestamine ebaõnnestus");
      }
    },
    [phoneticPanelEntryId, task, userId, setEntries, handleClosePhoneticPanel, dataService],
  );

  return {
    showPhoneticPanel,
    phoneticPanelEntryId,
    handleExplorePhonetic,
    handleClosePhoneticPanel,
    handlePhoneticApply,
  };
}
