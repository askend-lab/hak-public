// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useCallback, useRef } from "react";
import { SentenceState, convertTextToTags } from "@/types/synthesis";
import { useCopiedEntries } from "@/contexts/CopiedEntriesContext";
import { logger } from "@hak/shared";

const STORAGE_KEY = "eki_synthesis_state";
const LEGACY_PLAYLIST_KEY = "eki_playlist_entries";

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
    logger.error("Failed to load synthesis state from localStorage:", error);
  }
  return [INITIAL_SENTENCE];
};

type SetSentences = React.Dispatch<React.SetStateAction<SentenceState[]>>;

const CLEARED: Partial<SentenceState> = { tags: [], currentInput: "", text: "", stressedTags: null, phoneticText: null, audioUrl: null };
const mapInput = (id: string, v: string) => (s: SentenceState) => s.id === id ? { ...s, currentInput: v } : s;
const mapClear = (id: string) => (s: SentenceState) => s.id === id ? { ...s, ...CLEARED } : s;
const mapUpdate = (id: string, u: Partial<SentenceState>) => (s: SentenceState) => s.id === id ? { ...s, ...u } : s;
const mapAll = (u: Partial<SentenceState>) => (s: SentenceState) => ({ ...s, ...u });

function persistToStorage(sentences: SentenceState[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeForStorage(sentences)));
  } catch (error) {
    const isQuota = error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
    if (isQuota) { logger.warn("[Synthesis] localStorage quota exceeded — state not saved"); }
    else { logger.error("Failed to save synthesis state to localStorage:", error); }
  }
}

function mergeCopiedEntries(prev: SentenceState[], raw: RawEntry[]): SentenceState[] {
  const isEmpty = prev.length === 1 && prev[0]?.text === "" && prev[0]?.tags.length === 0;
  const transformed = raw.map(transformEntryToSentence);
  return isEmpty ? transformed : [...prev, ...transformed];
}

function usePersistEffect(sentences: SentenceState[]): void {
  const isInitial = useRef(true);
  useEffect(() => {
    if (isInitial.current) { isInitial.current = false; return; }
    persistToStorage(sentences);
  }, [sentences]);
}

function useLegacyMigration(setSentences: SetSentences): void {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LEGACY_PLAYLIST_KEY);
      if (!stored) {return;}
      const entries = JSON.parse(stored);
      if (Array.isArray(entries) && entries.length > 0) { setSentences(entries.map(transformEntryToSentence)); localStorage.removeItem(LEGACY_PLAYLIST_KEY); }
    } catch (error) { logger.error("Failed to load playlist from localStorage:", error); localStorage.removeItem(LEGACY_PLAYLIST_KEY); }
  }, [setSentences]);
}

function useCopiedEntriesEffect(setSentences: SetSentences): void {
  const { consumeCopiedEntries, hasCopiedEntries } = useCopiedEntries();
  useEffect(() => {
    const entries = consumeCopiedEntries();
    if (entries && entries.length > 0) { setSentences((prev) => mergeCopiedEntries(prev, entries)); }
  }, [consumeCopiedEntries, setSentences, hasCopiedEntries]);
}

const DEMO: SentenceState[] = [
  { id: "demo-1", text: "Noormees läks kooli", tags: ["Noormees", "läks", "kooli"], isPlaying: false, isLoading: false, currentInput: "", phoneticText: null, audioUrl: null, stressedTags: null },
  createEmptySentence("demo-2"),
];

export function useSentenceState() {
  const [sentences, setSentences] = useState<SentenceState[]>(loadInitialState);
  usePersistEffect(sentences);
  useLegacyMigration(setSentences);
  useCopiedEntriesEffect(setSentences);

  return {
    sentences, setSentences,
    setDemoSentences: useCallback(() => { setSentences(DEMO); }, []),
    handleTextChange: useCallback((id: string, v: string) => { setSentences((p) => p.map(mapInput(id, v))); }, []),
    handleClearSentence: useCallback((id: string) => { setSentences((p) => p.map(mapClear(id))); }, []),
    handleAddSentence: useCallback(() => { setSentences((p) => [...p, createEmptySentence(crypto.randomUUID())]); }, []),
    handleRemoveSentence: useCallback((id: string, revokeUrl?: boolean) => {
      const s = sentences.find((x) => x.id === id);
      if (revokeUrl && s?.audioUrl) { URL.revokeObjectURL(s.audioUrl); }
      setSentences(sentences.length === 1 ? [INITIAL_SENTENCE] : (p) => p.filter((x) => x.id !== id));
    }, [sentences]),
    updateSentence: useCallback((id: string, u: Partial<SentenceState>) => { setSentences((p) => p.map(mapUpdate(id, u))); }, []),
    updateAllSentences: useCallback((u: Partial<SentenceState>) => { setSentences((p) => p.map(mapAll(u))); }, []),
    getSentence: useCallback((id: string) => sentences.find((s) => s.id === id), [sentences]),
  };
}
