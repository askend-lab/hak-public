// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { SentenceState, normalizeTags, CACHE_INVALIDATION } from "@/types/synthesis";

type SentenceSetter = React.Dispatch<React.SetStateAction<SentenceState[]>>;
type TagTransformer = (sentence: SentenceState) => Partial<SentenceState>;

const applyTransform = (id: string, fn: TagTransformer) => (s: SentenceState) => s.id !== id ? s : { ...s, ...fn(s) };

function buildDeleteResult(s: SentenceState, tagIndex: number): Partial<SentenceState> {
  const newTags = normalizeTags(s.tags.filter((_, i) => i !== tagIndex));
  const newStressed = s.stressedTags ? normalizeTags(s.stressedTags.filter((_, i) => i !== tagIndex)) : undefined;
  return { tags: newTags, text: newTags.join(" "), stressedTags: newStressed, ...CACHE_INVALIDATION };
}

function buildReplaceResult(s: SentenceState, tagIndex: number, newWords: string[]): Partial<SentenceState> {
  const newTags = normalizeTags([...s.tags.slice(0, tagIndex), ...newWords, ...s.tags.slice(tagIndex + 1)]);
  const newStressed = s.stressedTags
    ? normalizeTags([...s.stressedTags.slice(0, tagIndex), ...newWords.map(() => undefined as unknown as string), ...s.stressedTags.slice(tagIndex + 1)].filter((t) => t !== undefined))
    : undefined;
  return { tags: newTags, text: newTags.join(" "), stressedTags: newStressed, ...CACHE_INVALIDATION };
}

function buildStressedResult(s: SentenceState, tagIndex: number, variantText: string): Partial<SentenceState> {
  const newStressed = s.stressedTags ? [...s.stressedTags] : [...s.tags];
  newStressed[tagIndex] = variantText;
  return { stressedTags: newStressed, phoneticText: newStressed.join(" "), audioUrl: undefined };
}

/**
 * Helper hook for updating sentence tags
 * Consolidates duplicate tag manipulation patterns in useSynthesis
 */
export function useTagUpdater(setSentences: SentenceSetter): {
  updateSentenceTags: (sentenceId: string, transformer: TagTransformer) => void;
  deleteTag: (sentenceId: string, tagIndex: number) => void;
  replaceTag: (
    sentenceId: string,
    tagIndex: number,
    newWords: string[],
  ) => void;
  updateStressedTag: (
    sentenceId: string,
    tagIndex: number,
    variantText: string,
  ) => void;
} {
  /**
   * Update a single sentence's tags using a transformer function
   */
  const updateSentenceTags = useCallback(
    (sentenceId: string, transformer: TagTransformer) => {
      setSentences((prev) => prev.map(applyTransform(sentenceId, transformer)));
    },
    [setSentences],
  );

  /**
   * Delete a tag at a specific index
   */
  const deleteTag = useCallback(
    (sentenceId: string, tagIndex: number) => {
      updateSentenceTags(sentenceId, (s) => buildDeleteResult(s, tagIndex));
    },
    [updateSentenceTags],
  );

  /**
   * Replace a tag at a specific index with new words
   */
  const replaceTag = useCallback(
    (sentenceId: string, tagIndex: number, newWords: string[]) => {
      updateSentenceTags(sentenceId, (s) => buildReplaceResult(s, tagIndex, newWords));
    },
    [updateSentenceTags],
  );

  /**
   * Update stressed tag at a specific index (for phonetic variants)
   */
  const updateStressedTag = useCallback(
    (sentenceId: string, tagIndex: number, variantText: string) => {
      updateSentenceTags(sentenceId, (s) => buildStressedResult(s, tagIndex, variantText));
    },
    [updateSentenceTags],
  );

  return {
    updateSentenceTags,
    deleteTag,
    replaceTag,
    updateStressedTag,
  };
}
