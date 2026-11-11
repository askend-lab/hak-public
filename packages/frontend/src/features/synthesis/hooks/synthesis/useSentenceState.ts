// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useEffect, useCallback } from "react";
import { SentenceState, convertTextToTags } from "@/types/synthesis";
import { useCopiedEntries } from "@/contexts/CopiedEntriesContext";
import { logger } from "@hak/shared";
import { useSentenceStore, createEmptySentence, INITIAL_SENTENCE } from "./synthesisStore";

export { useSentenceStore } from "./synthesisStore";

const LEGACY_PLAYLIST_KEY = "eki_playlist_entries";

const ensureSentenceState = (
  sentence: Partial<SentenceState> &
    Pick<SentenceState, "id" | "text" | "tags" | "isPlaying" | "isLoading" | "currentInput">,
): SentenceState => ({
  ...sentence,
  phoneticText: sentence.phoneticText ?? null,
  audioUrl: sentence.audioUrl ?? null,
  stressedTags: sentence.stressedTags ?? null,
});

interface RawEntry {
  id?: string;
  text: string;
  stressedText?: string;
  audioUrl?: string | null;
}

const transformEntryToSentence = (entry: RawEntry): SentenceState => {
  const words = convertTextToTags(entry.text);
  const stressedWords = entry.stressedText ? convertTextToTags(entry.stressedText) : [];
  return ensureSentenceState({
    id: entry.id || `entry_${crypto.randomUUID()}`,
    text: entry.text,
    tags: words,
    isPlaying: false,
    isLoading: false,
    currentInput: "",
    stressedTags: stressedWords.length === words.length ? stressedWords : undefined,
    audioUrl: entry.audioUrl,
    phoneticText: entry.stressedText,
  });
};

type SetSentences = React.Dispatch<React.SetStateAction<SentenceState[]>>;

const CLEARED: Partial<SentenceState> = { tags: [], currentInput: "", text: "", stressedTags: null, phoneticText: null, audioUrl: null };
const mapInput = (id: string, v: string) => (s: SentenceState) => s.id === id ? { ...s, currentInput: v } : s;
const mapClear = (id: string) => (s: SentenceState) => s.id === id ? { ...s, ...CLEARED } : s;
const mapUpdate = (id: string, u: Partial<SentenceState>) => (s: SentenceState) => s.id === id ? { ...s, ...u } : s;
const mapAll = (u: Partial<SentenceState>) => (s: SentenceState) => ({ ...s, ...u });


function mergeCopiedEntries(prev: SentenceState[], raw: RawEntry[]): SentenceState[] {
  const isEmpty = prev.length === 1 && prev[0]?.text === "" && prev[0]?.tags.length === 0;
  const transformed = raw.map(transformEntryToSentence);
  return isEmpty ? transformed : [...prev, ...transformed];
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

export function useSentenceState(): {
  sentences: SentenceState[];
  setSentences: (updater: SentenceState[] | ((prev: SentenceState[]) => SentenceState[])) => void;
  setDemoSentences: () => void;
  handleTextChange: (id: string, v: string) => void;
  handleClearSentence: (id: string) => void;
  handleAddSentence: () => void;
  handleRemoveSentence: (id: string, revokeUrl?: boolean) => void;
  updateSentence: (id: string, u: Partial<SentenceState>) => void;
  updateAllSentences: (u: Partial<SentenceState>) => void;
  getSentence: (id: string) => SentenceState | undefined;
} {
  const sentences = useSentenceStore((s) => s.sentences);
  const setSentences = useSentenceStore((s) => s.setSentences);

  useLegacyMigration(setSentences);
  useCopiedEntriesEffect(setSentences);

  return {
    sentences, setSentences,
    setDemoSentences: useCallback((): void => { setSentences(DEMO); }, [setSentences]),
    handleTextChange: useCallback((id: string, v: string): void => { setSentences((p) => p.map(mapInput(id, v))); }, [setSentences]),
    handleClearSentence: useCallback((id: string): void => { setSentences((p) => p.map(mapClear(id))); }, [setSentences]),
    handleAddSentence: useCallback((): void => { setSentences((p) => [...p, createEmptySentence(crypto.randomUUID())]); }, [setSentences]),
    handleRemoveSentence: useCallback((id: string, revokeUrl?: boolean): void => {
      const s = sentences.find((x) => x.id === id);
      if (revokeUrl && s?.audioUrl) { URL.revokeObjectURL(s.audioUrl); }
      setSentences(sentences.length === 1 ? [INITIAL_SENTENCE] : (p) => p.filter((x) => x.id !== id));
    }, [sentences, setSentences]),
    updateSentence: useCallback((id: string, u: Partial<SentenceState>): void => { setSentences((p) => p.map(mapUpdate(id, u))); }, [setSentences]),
    updateAllSentences: useCallback((u: Partial<SentenceState>): void => { setSentences((p) => p.map(mapAll(u))); }, [setSentences]),
    getSentence: useCallback((id: string): SentenceState | undefined => sentences.find((s) => s.id === id), [sentences]),
  };
}
