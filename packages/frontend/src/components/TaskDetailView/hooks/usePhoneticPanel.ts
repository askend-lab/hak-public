// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types */
import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { DataService } from "@/services/dataService";
import { stripPhoneticMarkers } from "@/utils/phoneticMarkers";

export function usePhoneticPanel(
  entries: TaskEntry[],
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>,
  task: Task | null,
  userId: string | undefined,
  onMenuClose: () => void,
) {
  const [showPhoneticPanel, setShowPhoneticPanel] = useState(false);
  const [phoneticPanelEntryId, setPhoneticPanelEntryId] = useState<
    string | null
  >(null);

  const handleExplorePhonetic = useCallback(
    async (entryId: string) => {
      const entry = entries.find((e) => e.id === entryId);
      if (!entry || !entry.text.trim()) return;

      onMenuClose();

      if (!entry.stressedText) {
        try {
          const analyzeResponse = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: entry.text }),
          });

          if (analyzeResponse.ok) {
            const { stressedText } = await analyzeResponse.json();
            if (stressedText) {
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === entryId ? { ...e, stressedText } : e,
                ),
              );
            }
          }
        } catch (error) {
          console.error("Failed to analyze entry:", error);
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
        await DataService.getInstance().updateTaskEntry(
          userId,
          task.id,
          phoneticPanelEntryId,
          {
            text: newPlainText,
            stressedText: newPhoneticText,
          },
        );
      } catch (error) {
        console.error("Failed to update entry:", error);
        alert("Viga: foneetilise kuju salvestamine ebaõnnestus");
      }
    },
    [phoneticPanelEntryId, task, userId, setEntries, handleClosePhoneticPanel],
  );

  return {
    showPhoneticPanel,
    phoneticPanelEntryId,
    handleExplorePhonetic,
    handleClosePhoneticPanel,
    handlePhoneticApply,
  };
}
