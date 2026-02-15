// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback, useMemo } from "react";
import { convertTextToTags } from "@/types/synthesis";
import { stripPhoneticMarkers } from "@/features/synthesis/utils/phoneticMarkers";
import { useSynthesisOrchestrator } from "./synthesis/useSynthesisOrchestrator";
import { useTagEditor } from "./synthesis/useTagEditor";
import { usePlaylistControl } from "./synthesis/usePlaylistControl";
import { useTagUpdater } from "./synthesis/useTagUpdater";
import { useInlineTagEditor } from "./synthesis/useInlineTagEditor";
import { useSentenceActions } from "./synthesis/useSentenceActions";

export function useSynthesis() {
  const orchestrator = useSynthesisOrchestrator();
  const {
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
    currentAudio,
    playSingleSentence,
    synthesizeAndPlay,
    synthesizeWithText,
  } = orchestrator;

  const tagEditor = useTagEditor(getSentence, updateSentence);
  const { handleInputBlur } = tagEditor;
  const tagUpdater = useTagUpdater(setSentences);

  const playlist = usePlaylistControl(
    sentences,
    playSingleSentence,
    () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    },
    updateAllSentences,
  );

  const inlineEditor = useInlineTagEditor({
    sentences,
    getSentence,
    tagUpdater,
    synthesizeWithText,
  });

  const actions = useSentenceActions({
    getSentence,
    updateSentence,
    synthesizeAndPlay,
    synthesizeWithText,
    handleRemoveSentence,
    currentAudio,
    playlist,
  });

  const handleKeyDown = (e: React.KeyboardEvent, id: string): void => {
    tagEditor.handleKeyDown(e, id, (id: string, text?: string): void => {
      if (text) {
        synthesizeWithText(id, text);
      } else {
        synthesizeAndPlay(id);
      }
    });
  };

  const handleUseVariant = useCallback(
    (
      variantText: string,
      selectedSentenceId: string | null,
      selectedTagIndex: number | null,
    ) => {
      if (selectedSentenceId !== null && selectedTagIndex !== null) {
        tagUpdater.updateStressedTag(
          selectedSentenceId,
          selectedTagIndex,
          variantText,
        );
      }
    },
    [tagUpdater],
  );

  const handleSentencePhoneticApply = useCallback(
    (sentenceId: string, newPhoneticText: string) => {
      setSentences((prev) =>
        prev.map((s) => {
          if (s.id !== sentenceId) return s;
          const newPlainText = stripPhoneticMarkers(newPhoneticText) || "";
          const newTags = convertTextToTags(newPlainText);
          const newStressedTags = convertTextToTags(newPhoneticText);
          return {
            ...s,
            text: newPlainText,
            tags: newTags,
            phoneticText: newPhoneticText,
            stressedTags: newStressedTags,
            audioUrl: undefined,
          };
        }),
      );
    },
    [setSentences],
  );

  return useMemo(() => ({
    sentences,
    setSentences,
    isPlayingAll: playlist.isPlayingAll,
    isLoadingPlayAll: playlist.isLoadingPlayAll,
    editingTag: inlineEditor.editingTag,
    openTagMenu: inlineEditor.openTagMenu,
    setOpenTagMenu: inlineEditor.setOpenTagMenu,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence: actions.handleRemoveSentence,
    handleInputBlur,
    handleKeyDown,
    handlePlay: actions.handlePlay,
    handlePlayAll: playlist.handlePlayAll,
    handleDownload: actions.handleDownload,
    handleCopyText: actions.handleCopyText,
    handleDeleteTag: inlineEditor.handleDeleteTag,
    handleEditTag: inlineEditor.handleEditTag,
    handleEditTagChange: inlineEditor.handleEditTagChange,
    handleEditTagCommit: inlineEditor.handleEditTagCommit,
    handleEditTagKeyDown: inlineEditor.handleEditTagKeyDown,
    handleUseVariant,
    handleSentencePhoneticApply,
    synthesizeAndPlay,
  }), [
    sentences,
    setSentences,
    playlist.isPlayingAll,
    playlist.isLoadingPlayAll,
    inlineEditor.editingTag,
    inlineEditor.openTagMenu,
    inlineEditor.setOpenTagMenu,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    actions.handleRemoveSentence,
    handleInputBlur,
    handleKeyDown,
    actions.handlePlay,
    playlist.handlePlayAll,
    actions.handleDownload,
    actions.handleCopyText,
    inlineEditor.handleDeleteTag,
    inlineEditor.handleEditTag,
    inlineEditor.handleEditTagChange,
    inlineEditor.handleEditTagCommit,
    inlineEditor.handleEditTagKeyDown,
    handleUseVariant,
    handleSentencePhoneticApply,
    synthesizeAndPlay,
  ]);
}
