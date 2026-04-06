// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SentenceState } from "@/types/synthesis";
import { logger } from "@hak/shared";

const STORAGE_KEY = "eki_synthesis_state";

const createEmptySentence = (id: string): SentenceState => ({
  id,
  text: "",
  tags: [],
  isPlaying: false,
  isLoading: false,
  currentInput: "",
  phoneticText: null,
  audioUrl: null,
  stressedTags: null,
});

const INITIAL_SENTENCE: SentenceState = createEmptySentence("1");

const sanitizeForStorage = (sentences: SentenceState[]): Partial<SentenceState>[] =>
  sentences.map((s) => ({
    id: s.id, text: s.text, tags: s.tags, currentInput: s.currentInput,
    phoneticText: s.phoneticText, audioUrl: s.audioUrl, stressedTags: s.stressedTags,
  }));

const ensureSentenceState = (
  s: Partial<SentenceState> & Pick<SentenceState, "id" | "text" | "tags" | "isPlaying" | "isLoading" | "currentInput">,
): SentenceState => ({
  ...s, phoneticText: s.phoneticText ?? null, audioUrl: s.audioUrl ?? null, stressedTags: s.stressedTags ?? null,
});

const restoreFromStorage = (stored: Partial<SentenceState>[]): SentenceState[] =>
  stored.map((s) => ensureSentenceState({
    id: s.id || `entry_${crypto.randomUUID()}`, text: s.text || "", tags: s.tags || [],
    isPlaying: false, isLoading: false, currentInput: s.currentInput || "",
    phoneticText: s.phoneticText, audioUrl: s.audioUrl, stressedTags: s.stressedTags,
  }));

const loadInitialState = (): SentenceState[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) { return restoreFromStorage(parsed); }
    }
  } catch (error) { logger.error("Failed to load synthesis state from localStorage:", error); }
  return [INITIAL_SENTENCE];
};

export interface SentenceStore {
  sentences: SentenceState[];
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  setSentences: (updater: SentenceState[] | ((prev: SentenceState[]) => SentenceState[])) => void;
  setIsPlayingAll: (value: boolean) => void;
  setIsLoadingPlayAll: (value: boolean) => void;
  _reset: () => void;
}

export const useSentenceStore = create<SentenceStore>()(
  persist(
    (set) => ({
      sentences: loadInitialState(),
      isPlayingAll: false,
      isLoadingPlayAll: false,
      setSentences: (updater): void => {
        set((state) => ({ sentences: typeof updater === "function" ? updater(state.sentences) : updater }));
      },
      setIsPlayingAll: (value: boolean): void => { set({ isPlayingAll: value }); },
      setIsLoadingPlayAll: (value: boolean): void => { set({ isLoadingPlayAll: value }); },
      _reset: (): void => { set({ sentences: [INITIAL_SENTENCE], isPlayingAll: false, isLoadingPlayAll: false }); },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sentences: sanitizeForStorage(state.sentences) }),
      merge: (persisted, current) => {
        const p = persisted as { sentences?: Partial<SentenceState>[] } | undefined;
        if (p?.sentences && p.sentences.length > 0) { return { ...current, sentences: restoreFromStorage(p.sentences) }; }
        return current;
      },
    },
  ),
);

export { createEmptySentence, INITIAL_SENTENCE };
