// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { SentenceState, convertTextToTags, normalizeTags, CACHE_INVALIDATION } from "@/types/synthesis";

type SynthFn = (id: string, text?: string) => void;

function useTagMutations(getSentence: (id: string) => SentenceState | undefined, updateSentence: (id: string, u: Partial<SentenceState>) => void) {
  const handleInputBlur = useCallback((id: string) => {
    const sentence = getSentence(id);
    if (!sentence || !sentence.currentInput.trim() || sentence.tags.length === 0) {return;}
    const allTags = normalizeTags([...sentence.tags, ...convertTextToTags(sentence.currentInput)]);
    updateSentence(id, { tags: allTags, currentInput: "", text: allTags.join(" "), ...CACHE_INVALIDATION });
  }, [getSentence, updateSentence]);

  const addTagsToSentence = useCallback((id: string, currentInput: string) => {
    const sentence = getSentence(id);
    if (!sentence) {return null;}
    const allTags = normalizeTags([...sentence.tags, ...convertTextToTags(currentInput)]);
    const newText = allTags.join(" ");
    const updates: Partial<SentenceState> = { tags: allTags, currentInput: "", text: newText };
    if (newText !== sentence.text) { updates.phoneticText = undefined; updates.audioUrl = undefined; }
    updateSentence(id, updates);
    return newText;
  }, [getSentence, updateSentence]);

  const removeLastTag = useCallback((id: string) => {
    const sentence = getSentence(id);
    if (!sentence || sentence.tags.length === 0) {return;}
    const newTags = sentence.tags.slice(0, -1);
    updateSentence(id, { tags: newTags, currentInput: sentence.tags[sentence.tags.length - 1] ?? "", text: newTags.join(" "), ...CACHE_INVALIDATION });
  }, [getSentence, updateSentence]);

  return { handleInputBlur, addTagsToSentence, removeLastTag };
}

interface EnterOpts { sentence: SentenceState; id: string; addTags: (id: string, input: string) => string | null }
function handleEnter(opts: EnterOpts, onSynth: SynthFn): void {
  if (opts.sentence.currentInput.trim()) { const t = opts.addTags(opts.id, opts.sentence.currentInput); if (t) { onSynth(opts.id, t); } }
  else if (opts.sentence.tags.length > 0) { onSynth(opts.id); }
}

function isSpaceAction(s: SentenceState, key: string): boolean {
  return key === " " && Boolean(s.currentInput.trim()) && s.tags.length > 0;
}

function useKeyHandler(getSentence: (id: string) => SentenceState | undefined, mutations: ReturnType<typeof useTagMutations>) {
  const { addTagsToSentence, removeLastTag } = mutations;
  return useCallback((e: React.KeyboardEvent, id: string, onSynthesize: SynthFn) => {
    const s = getSentence(id);
    if (!s) {return;}
    if (isSpaceAction(s, e.key)) { e.preventDefault(); addTagsToSentence(id, s.currentInput); }
    else if (e.key === "Enter") { e.preventDefault(); handleEnter({ sentence: s, id, addTags: addTagsToSentence }, onSynthesize); }
    else if (e.key === "Backspace" && !s.currentInput && s.tags.length > 0) { e.preventDefault(); removeLastTag(id); }
  }, [getSentence, addTagsToSentence, removeLastTag]);
}

export function useTagEditor(
  getSentence: (id: string) => SentenceState | undefined,
  updateSentence: (id: string, updates: Partial<SentenceState>) => void,
) {
  const mutations = useTagMutations(getSentence, updateSentence);
  const handleKeyDown = useKeyHandler(getSentence, mutations);
  return { ...mutations, handleKeyDown };
}
