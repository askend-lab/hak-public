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

/**
 * Checks whether a token contains at least one letter or digit.
 * Tokens that are purely punctuation/symbols return false.
 */
function isWordToken(token: string): boolean {
  return /[\p{L}\p{N}]/u.test(token);
}

/**
 * Merges punctuation-only tokens into adjacent word tokens.
 *
 * Rules:
 * - A punctuation-only token is left-attached to the preceding token.
 * - If there is no preceding token, it is right-attached to the following token.
 * - Consecutive punctuation-only tokens accumulate into the same target.
 *
 * Examples:
 *   ["kool", "."]          → ["kool."]
 *   [".", "kool"]          → [".kool"]
 *   ["tere", ",", "maailm"] → ["tere,", "maailm"]
 *   ["(", "tere", ")"]     → ["(tere)"]
 */
export function normalizeTags(tags: string[]): string[] {
  if (tags.length === 0) return [];

  const result: string[] = [];

  // Pass 1: left-attach punctuation-only tokens to the previous token
  for (const tag of tags) {
    if (isWordToken(tag)) {
      result.push(tag);
    } else {
      // Purely punctuation — attach to previous token
      if (result.length > 0) {
        result[result.length - 1] += tag;
      } else {
        // No previous token yet; will be right-attached in pass 2
        result.push(tag);
      }
    }
  }

  // Pass 2: right-attach if the first token is still punctuation-only
  if (result.length > 1 && !isWordToken(result[0])) {
    result[1] = result[0] + result[1];
    result.shift();
  }

  return result;
}

/**
 * Splits text into word tags and normalizes punctuation attachment.
 */
export function convertTextToTags(text: string): string[] {
  const rawTokens = text
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  return normalizeTags(rawTokens);
}

/**
 * Strips leading and trailing punctuation from a word for API lookups
 * (e.g. pronunciation variants). Preserves dashes since they can be
 * part of compound words (e.g. "läbi-kukkuja").
 */
export function stripPunctuationForLookup(word: string): string {
  return word.replace(/^[^\p{L}\p{N}\-]+|[^\p{L}\p{N}\-]+$/gu, "");
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
