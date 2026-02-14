// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { Task, TaskEntry } from "@/types/task";
import { useDataService } from "@/contexts/DataServiceContext";
import { convertTextToTags } from "@/types/synthesis";

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
      if (selectedEntryId !== null && selectedTagIndex !== null && task) {
        const entryToUpdate = entries.find((e) => e.id === selectedEntryId);
        if (!entryToUpdate) {
          handleCloseVariants();
          return;
        }

        const displayWords = convertTextToTags(entryToUpdate.text);
        const stressedWords = convertTextToTags(entryToUpdate.stressedText || entryToUpdate.text);

        if (selectedTagIndex < 0 || selectedTagIndex >= displayWords.length) {
          handleCloseVariants();
          return;
        }

        stressedWords[selectedTagIndex] = variantText;
        const newStressedText = stressedWords.join(" ");
        const newText = entryToUpdate.text;

        setEntries((prev) =>
          prev.map((entry) => {
            if (entry.id === selectedEntryId) {
              return {
                ...entry,
                text: newText,
                stressedText: newStressedText,
                audioUrl: null,
                audioBlob: null,
              };
            }
            return entry;
          }),
        );

        handleCloseVariants();

        try {
          if (userId) {
            await dataService.updateTaskEntry(
              userId,
              task.id,
              selectedEntryId,
              {
                text: newText,
                stressedText: newStressedText,
              },
            );
          }
        } catch {
          setEntries((prev) =>
            prev.map((entry) =>
              entry.id === selectedEntryId ? entryToUpdate : entry,
            ),
          );
          alert("Viga: variandi salvestamine ebaõnnestus");
        }
      } else {
        handleCloseVariants();
      }
    },
    [
      selectedEntryId,
      selectedTagIndex,
      task,
      entries,
      setEntries,
      userId,
      handleCloseVariants,
      dataService,
    ],
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
