// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback, useRef } from "react";
import { EditingTag, OpenTagMenu, SentenceState, convertTextToTags, normalizeTags } from "@/types/synthesis";
import type { useTagUpdater } from "./useTagUpdater";

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

export function useInlineTagEditor({
  sentences,
  getSentence,
  tagUpdater,
  synthesizeWithText,
}: UseInlineTagEditorDeps) {
  const [editingTag, setEditingTag] = useState<EditingTag>(null);
  const [openTagMenu, setOpenTagMenu] = useState<OpenTagMenu>(null);

  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;

  const handleDeleteTag = useCallback(
    (sentenceId: string, tagIndex: number) => {
      tagUpdater.deleteTag(sentenceId, tagIndex);
      setOpenTagMenu(null);
    },
    [tagUpdater],
  );

  const handleEditTag = useCallback(
    (sentenceId: string, tagIndex: number) => {
      const sentence = getSentence(sentenceId);
      if (!sentence) {return;}
      const word = sentence.tags[tagIndex] ?? "";
      setEditingTag({ sentenceId, tagIndex, value: word });
      setOpenTagMenu(null);
    },
    [getSentence],
  );

  const handleEditTagChange = useCallback(
    (value: string) => {
      if (!editingTag) {return;}
      setEditingTag({ ...editingTag, value });
    },
    [editingTag],
  );

  const handleEditTagCommit = useCallback(() => {
    if (!editingTag) {return;}
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      tagUpdater.deleteTag(sentenceId, tagIndex);
    } else {
      const newWords = convertTextToTags(trimmedValue);
      tagUpdater.replaceTag(sentenceId, tagIndex, newWords);
    }
    setEditingTag(null);
  }, [editingTag, tagUpdater]);

  const commitAndSynthesize = useCallback(() => {
    if (!editingTag) {return;}
    const { sentenceId, tagIndex, value } = editingTag;
    const trimmedValue = value.trim();
    const sentence = sentencesRef.current.find((s) => s.id === sentenceId);
    const newText = sentence ? computeNewText(sentence.tags, tagIndex, trimmedValue) : "";
    handleEditTagCommit();
    if (newText) { synthesizeWithText(sentenceId, newText); }
  }, [editingTag, handleEditTagCommit, synthesizeWithText]);

  const handleEditTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); commitAndSynthesize(); }
      else if (e.key === " ") { e.preventDefault(); handleEditTagCommit(); }
      else if (e.key === "Escape") { e.preventDefault(); setEditingTag(null); }
    },
    [commitAndSynthesize, handleEditTagCommit],
  );

  return {
    editingTag,
    openTagMenu,
    setOpenTagMenu,
    handleDeleteTag,
    handleEditTag,
    handleEditTagChange,
    handleEditTagCommit,
    handleEditTagKeyDown,
  };
}
