// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export type SentenceState = {
  id: string;
  text: string;
  tags: string[];
  isPlaying: boolean;
  isLoading: boolean;
  currentInput: string;
  phoneticText?: string | null | undefined;
  audioUrl?: string | null | undefined;
  stressedTags?: string[] | null | undefined;
};

export type EditingTag = {
  sentenceId: string;
  tagIndex: number;
  value: string;
} | null;

export type OpenTagMenu = {
  sentenceId: string;
  tagIndex: number;
} | null;

export const VOICE_SINGLE = "efm_s";
export const VOICE_MULTI = "efm_l";

export function getVoiceModel(text: string): typeof VOICE_SINGLE | typeof VOICE_MULTI {
  const words = convertTextToTags(text);
  return words.length === 1 ? VOICE_SINGLE : VOICE_MULTI;
}

export function convertTextToTags(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Filters sentences that have non-empty text.
 * Common pattern used across components for playlist/task operations.
 */
export function filterNonEmptySentences<T extends { text: string }>(
  sentences: T[],
): T[] {
  return sentences.filter((s) => s.text.trim());
}

/**
 * Standard updates to invalidate cached synthesis results.
 * Used when text/tags change and audio needs re-synthesis.
 */
export const CACHE_INVALIDATION: Pick<SentenceState, "phoneticText" | "audioUrl"> = {
  phoneticText: undefined,
  audioUrl: undefined,
};
