// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { convertTextToTags } from "@/types/synthesis";
import { logger } from "@hak/shared";

function buildVariantUpdate(entry: TaskEntry, tagIndex: number, variantText: string): { newStressedText: string; updatedEntry: TaskEntry } | null {
  const displayWords = convertTextToTags(entry.text);
  if (tagIndex < 0 || tagIndex >= displayWords.length) {return null;}
  const stressedWords = convertTextToTags(entry.stressedText || entry.text);
  stressedWords[tagIndex] = variantText;
  const newStressedText = stressedWords.join(" ");
  return { newStressedText, updatedEntry: { ...entry, stressedText: newStressedText, audioUrl: null, audioBlob: null } };
}

interface UsePronunciationVariantsReturn {
  variantsWord: string | null;
  variantsCustomPhonetic: string | null;
  isVariantsPanelOpen: boolean;
  selectedEntryId: string | null;
  selectedTagIndex: number | null;
  handleTagClick: (entryId: string, tagIndex: number, word: string) => void;
  handleCloseVariants: () => void;
  handleUseVariant: (variantText: string) => Promise<void>;
}

export function usePronunciationVariants(
  entries: TaskEntry[],
  setEntries: React.Dispatch<React.SetStateAction<TaskEntry[]>>,
  task: Task | null,
  userId: string | undefined,
): UsePronunciationVariantsReturn {
  const dataService = useDataService();
  const [variantsWord, setVariantsWord] = useState<string | null>(null);
  const [variantsCustomPhonetic, setVariantsCustomPhonetic] = useState<
    string | null
  >(null);
  const [isVariantsPanelOpen, setIsVariantsPanelOpen] =
    useState<boolean>(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);

  const handleTagClick = useCallback(
    (entryId: string, tagIndex: number, word: string) => {
      const entry = entries.find((e) => e.id === entryId);
      const stressedWords = entry?.stressedText
        ? convertTextToTags(entry.stressedText)
        : undefined;
      const customPhoneticForm = stressedWords?.[tagIndex];

      setSelectedEntryId(entryId);
      setSelectedTagIndex(tagIndex);
      setVariantsWord(word);
      setVariantsCustomPhonetic(customPhoneticForm || null);
      setIsVariantsPanelOpen(true);
    },
    [entries],
  );

  const handleCloseVariants = useCallback(() => {
    setIsVariantsPanelOpen(false);
    setVariantsWord(null);
    setVariantsCustomPhonetic(null);
    setSelectedEntryId(null);
    setSelectedTagIndex(null);
  }, []);

  const handleUseVariant = useCallback(
    async (variantText: string) => {
      if (selectedEntryId === null || selectedTagIndex === null || !task) { handleCloseVariants(); return; }
      const entryToUpdate = entries.find((e) => e.id === selectedEntryId);
      if (!entryToUpdate) { handleCloseVariants(); return; }
      const update = buildVariantUpdate(entryToUpdate, selectedTagIndex, variantText);
      if (!update) { handleCloseVariants(); return; }

      setEntries((prev) => prev.map((entry) => (entry.id === selectedEntryId ? update.updatedEntry : entry)));
      handleCloseVariants();
      try {
        if (userId) { await dataService.updateTaskEntry(task.id, selectedEntryId, { text: entryToUpdate.text, stressedText: update.newStressedText }); }
      } catch {
        setEntries((prev) => prev.map((entry) => (entry.id === selectedEntryId ? entryToUpdate : entry)));
        logger.error("Viga: variandi salvestamine ebaõnnestus");
      }
    },
    [selectedEntryId, selectedTagIndex, task, entries, setEntries, userId, handleCloseVariants, dataService],
  );

  return {
    variantsWord,
    variantsCustomPhonetic,
    isVariantsPanelOpen,
    selectedEntryId,
    selectedTagIndex,
    handleTagClick,
    handleCloseVariants,
    handleUseVariant,
  };
}
