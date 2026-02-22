// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback, useRef } from "react";
import { EditingTag, OpenTagMenu, SentenceState, convertTextToTags, normalizeTags } from "@/types/synthesis";
import type { useTagUpdater } from "./useTagUpdater";

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

  const handleEditTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (editingTag) {
          const sentenceId = editingTag.sentenceId;
          const tagIndex = editingTag.tagIndex;
          const trimmedValue = editingTag.value.trim();
          // Compute the new text BEFORE commit clears editingTag
          const sentence = sentencesRef.current.find(
            (s) => s.id === sentenceId,
          );
          let newText = "";
          if (sentence) {
            if (trimmedValue === "") {
              const newTags = sentence.tags.filter((_, i) => i !== tagIndex);
              newText = newTags.join(" ");
            } else {
              const newWords = convertTextToTags(trimmedValue);
              const newTags = normalizeTags([
                ...sentence.tags.slice(0, tagIndex),
                ...newWords,
                ...sentence.tags.slice(tagIndex + 1),
              ]);
              newText = newTags.join(" ");
            }
          }
          handleEditTagCommit();
          // Use synthesizeWithText to pass the correct text directly, bypassing stale ref
          if (newText) {
            synthesizeWithText(sentenceId, newText);
          }
        }
      } else if (e.key === " ") {
        e.preventDefault();
        handleEditTagCommit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditingTag(null);
      }
    },
    [editingTag, handleEditTagCommit, synthesizeWithText],
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
