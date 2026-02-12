// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useCallback, useRef } from "react";
import { SentenceState, convertTextToTags } from "@/types/synthesis";

const STORAGE_KEY = "eki_synthesis_state";

const ensureSentenceState = (
  sentence: Partial<SentenceState> &
    Pick<
      SentenceState,
      "id" | "text" | "tags" | "isPlaying" | "isLoading" | "currentInput"
    >,
): SentenceState => ({
  ...sentence,
  phoneticText: sentence.phoneticText ?? null,
  audioUrl: sentence.audioUrl ?? null,
  stressedTags: sentence.stressedTags ?? null,
});

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

// Helper to sanitize sentences for storage (strip transient UI state)
const sanitizeForStorage = (
  sentences: SentenceState[],
): Partial<SentenceState>[] => {
  return sentences.map((s) => ({
    id: s.id,
    text: s.text,
    tags: s.tags,
    currentInput: s.currentInput,
    phoneticText: s.phoneticText,
    audioUrl: s.audioUrl,
    stressedTags: s.stressedTags,
    // Intentionally omit isPlaying and isLoading - these are transient UI state
  }));
};

// Helper to transform a raw entry (from legacy storage or shared task) into SentenceState
interface RawEntry {
  id?: string;
  text: string;
  stressedText?: string;
  audioUrl?: string | null;
}

const transformEntryToSentence = (entry: RawEntry): SentenceState => {
  const words = convertTextToTags(entry.text);
  const stressedWords = entry.stressedText
    ? convertTextToTags(entry.stressedText)
    : [];
  return ensureSentenceState({
    id: entry.id || `entry_${crypto.randomUUID()}`,
    text: entry.text,
    tags: words,
    isPlaying: false,
    isLoading: false,
    currentInput: "",
    stressedTags:
      stressedWords.length === words.length
        ? stressedWords
        : undefined,
    audioUrl: entry.audioUrl,
    phoneticText: entry.stressedText,
  });
};

// Helper to restore sentences from storage
const restoreFromStorage = (
  stored: Partial<SentenceState>[],
): SentenceState[] => {
  return stored.map((s) =>
    ensureSentenceState({
      id: s.id || `entry_${crypto.randomUUID()}`,
      text: s.text || "",
      tags: s.tags || [],
      isPlaying: false,
      isLoading: false,
      currentInput: s.currentInput || "",
      phoneticText: s.phoneticText,
      audioUrl: s.audioUrl,
      stressedTags: s.stressedTags,
    }),
  );
};

// Helper to load initial state from localStorage
const loadInitialState = (): SentenceState[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return restoreFromStorage(parsed);
      }
    }
  } catch (error) {
    console.error("Failed to load synthesis state from localStorage:", error);
  }
  return [INITIAL_SENTENCE];
};

export function useSentenceState(): {
  sentences: SentenceState[];
  setSentences: React.Dispatch<React.SetStateAction<SentenceState[]>>;
  setDemoSentences: () => void;
  handleTextChange: (id: string, value: string) => void;
  handleClearSentence: (id: string) => void;
  handleAddSentence: () => void;
  handleRemoveSentence: (id: string, revokeUrl?: boolean) => void;
  updateSentence: (id: string, updates: Partial<SentenceState>) => void;
  updateAllSentences: (updates: Partial<SentenceState>) => void;
  getSentence: (id: string) => SentenceState | undefined;
} {
  const [sentences, setSentences] = useState<SentenceState[]>(loadInitialState);
  const isInitialMount = useRef(true);

  // Persist sentences to localStorage whenever they change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      const toStore = sanitizeForStorage(sentences);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error("Failed to save synthesis state to localStorage:", error);
    }
  }, [sentences]);

  // Legacy migration from eki_playlist_entries
  useEffect(() => {
    try {
      const storedPlaylist = localStorage.getItem("eki_playlist_entries");
      if (storedPlaylist) {
        const entries = JSON.parse(storedPlaylist);
        if (Array.isArray(entries) && entries.length > 0) {
          setSentences(entries.map(transformEntryToSentence));
          localStorage.removeItem("eki_playlist_entries");
        }
      }
    } catch (error) {
      console.error("Failed to load playlist from localStorage:", error);
      localStorage.removeItem("eki_playlist_entries");
    }
  }, []);

  // Load copied entries from shared task
  useEffect(() => {
    try {
      const copied = sessionStorage.getItem("copiedEntries");
      if (copied) {
        const entries = JSON.parse(copied);
        if (Array.isArray(entries) && entries.length > 0) {
          setSentences(entries.map(transformEntryToSentence));
          sessionStorage.removeItem("copiedEntries");
        }
      }
    } catch (error) {
      console.error(
        "Failed to load copied entries from sessionStorage:",
        error,
      );
      sessionStorage.removeItem("copiedEntries");
    }
  }, []);

  const setDemoSentences = useCallback(() => {
    setSentences([
      {
        id: "demo-1",
        text: "Noormees läks kooli",
        tags: ["Noormees", "läks", "kooli"],
        isPlaying: false,
        isLoading: false,
        currentInput: "",
        phoneticText: null,
        audioUrl: null,
        stressedTags: null,
      },
      createEmptySentence("demo-2"),
    ]);
  }, []);

  const handleTextChange = useCallback((id: string, value: string) => {
    setSentences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, currentInput: value } : s)),
    );
  }, []);

  const handleClearSentence = useCallback((id: string) => {
    setSentences((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              tags: [],
              currentInput: "",
              text: "",
              stressedTags: null,
              phoneticText: null,
              audioUrl: null,
            }
          : s,
      ),
    );
  }, []);

  const handleAddSentence = useCallback(() => {
    setSentences((prev) => [
      ...prev,
      createEmptySentence(crypto.randomUUID()),
    ]);
  }, []);

  const handleRemoveSentence = useCallback(
    (id: string, revokeUrl?: boolean) => {
      const sentence = sentences.find((s) => s.id === id);
      if (revokeUrl && sentence?.audioUrl) {
        URL.revokeObjectURL(sentence.audioUrl);
      }
      if (sentences.length === 1) {
        setSentences([INITIAL_SENTENCE]);
      } else {
        setSentences((prev) => prev.filter((s) => s.id !== id));
      }
    },
    [sentences],
  );

  const updateSentence = useCallback(
    (id: string, updates: Partial<SentenceState>) => {
      setSentences((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const updateAllSentences = useCallback((updates: Partial<SentenceState>) => {
    setSentences((prev) => prev.map((s) => ({ ...s, ...updates })));
  }, []);

  const getSentence = useCallback(
    (id: string) => {
      return sentences.find((s) => s.id === id);
    },
    [sentences],
  );

  return {
    sentences,
    setSentences,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence,
    updateSentence,
    updateAllSentences,
    getSentence,
  };
}
