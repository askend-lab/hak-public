// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { stripPhoneticMarkers } from "@/features/synthesis/utils/phoneticMarkers";
import { analyzeText } from "@/features/synthesis/utils/analyzeApi";
import { logger } from "@hak/shared";

const mapStressed = (id: string, stressedText: string) => (e: TaskEntry) => e.id === id ? { ...e, stressedText } : e;
const mapPhoneticUpdate = (id: string, text: string, stressedText: string) => (e: TaskEntry) => e.id === id ? { ...e, text, stressedText, audioUrl: null, audioBlob: null } : e;

interface PhoneticPanelDeps {
  entries: TaskEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>;
  task: Task | null;
  userId: string | undefined;
  onMenuClose: () => void;
}

interface UsePhoneticPanelReturn {
  showPhoneticPanel: boolean;
  phoneticPanelEntryId: string | null;
  handleExplorePhonetic: (entryId: string) => Promise<void>;
  handleClosePhoneticPanel: () => void;
  handlePhoneticApply: (newPhoneticText: string) => Promise<void>;
}

export function usePhoneticPanel(deps: PhoneticPanelDeps): UsePhoneticPanelReturn {
  const { entries, setEntries, task, userId, onMenuClose } = deps;
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
        const stressed = await analyzeText(entry.text);
        if (stressed) { setEntries((prev) => prev.map(mapStressed(entryId, stressed))); }
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

      setEntries((prev) => prev.map(mapPhoneticUpdate(phoneticPanelEntryId, newPlainText, newPhoneticText)));

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
        logger.error("Viga: häälduskuju salvestamine ebaõnnestus");
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
