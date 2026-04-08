// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback, useRef } from "react";
import { EditingTag, SentenceState, convertTextToTags, normalizeTags } from "@/types/synthesis";
import type { useTagUpdater } from "./useTagUpdater";
import { useSentenceStore } from "./synthesisStore";

function computeNewText(tags: string[], tagIndex: number, trimmedValue: string): string {
  if (trimmedValue === "") {
    return tags.filter((_, i) => i !== tagIndex).join(" ");
  }
  const newWords = convertTextToTags(trimmedValue);
  return normalizeTags([...tags.slice(0, tagIndex), ...newWords, ...tags.slice(tagIndex + 1)]).join(" ");
}

interface UseInlineTagEditorDeps {
  sentences: SentenceState[];
  getSentence: (id: string) => SentenceState | undefined;
  tagUpdater: ReturnType<typeof useTagUpdater>;
  synthesizeWithText: (id: string, text: string) => void;
}

function useTagCommit(opts: { editingTag: EditingTag; tagUpdater: ReturnType<typeof useTagUpdater>; sentencesRef: React.RefObject<SentenceState[]>; synthesizeWithText: (id: string, text: string) => void }) {
  const { editingTag, tagUpdater, sentencesRef, synthesizeWithText } = opts;
  const handleEditTagCommit = useCallback(() => {
    if (!editingTag) {return;}
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmed = value.trim();
    if (trimmed === "") { tagUpdater.deleteTag(sentenceId, tagIndex); }
    else { tagUpdater.replaceTag(sentenceId, tagIndex, convertTextToTags(trimmed)); }
  }, [editingTag, tagUpdater]);

  const commitAndSynthesize = useCallback(() => {
    if (!editingTag) {return;}
    const { sentenceId, tagIndex, value } = editingTag;
    const sentence = sentencesRef.current.find((s) => s.id === sentenceId);
    const newText = sentence ? computeNewText(sentence.tags, tagIndex, value.trim()) : "";
    handleEditTagCommit();
    if (newText) { synthesizeWithText(sentenceId, newText); }
  }, [editingTag, handleEditTagCommit, synthesizeWithText, sentencesRef]);

  return { handleEditTagCommit, commitAndSynthesize };
}

export function useInlineTagEditor({ sentences, getSentence, tagUpdater, synthesizeWithText }: UseInlineTagEditorDeps) {
  const editingTag = useSentenceStore((s) => s.editingTag);
  const setEditingTag = useSentenceStore((s) => s.setEditingTag);
  const openTagMenu = useSentenceStore((s) => s.openTagMenu);
  const setOpenTagMenu = useSentenceStore((s) => s.setOpenTagMenu);
  const sentencesRef = useRef(sentences); sentencesRef.current = sentences;

  const handleDeleteTag = useCallback((sid: string, idx: number) => { tagUpdater.deleteTag(sid, idx); setOpenTagMenu(null); }, [tagUpdater, setOpenTagMenu]);
  const handleEditTag = useCallback((sid: string, idx: number) => {
    const s = getSentence(sid); if (!s) {return;}
    setEditingTag({ sentenceId: sid, tagIndex: idx, value: s.tags[idx] ?? "" }); setOpenTagMenu(null);
  }, [getSentence, setEditingTag, setOpenTagMenu]);
  const handleEditTagChange = useCallback((value: string) => { if (editingTag) {setEditingTag({ ...editingTag, value });} }, [editingTag, setEditingTag]);

  const { handleEditTagCommit, commitAndSynthesize } = useTagCommit({ editingTag, tagUpdater, sentencesRef, synthesizeWithText });
  const commitAndClear = useCallback(() => { handleEditTagCommit(); setEditingTag(null); }, [handleEditTagCommit, setEditingTag]);
  const commitSynthAndClear = useCallback(() => { commitAndSynthesize(); setEditingTag(null); }, [commitAndSynthesize, setEditingTag]);

  const handleEditTagKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commitSynthAndClear(); }
    else if (e.key === " ") { e.preventDefault(); commitAndClear(); }
    else if (e.key === "Escape") { e.preventDefault(); setEditingTag(null); }
  }, [commitSynthAndClear, commitAndClear, setEditingTag]);

  return { editingTag, openTagMenu, setOpenTagMenu, handleDeleteTag, handleEditTag, handleEditTagChange, handleEditTagCommit: commitAndClear, handleEditTagKeyDown };
}
