// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback, useRef } from "react";
import { EditingTag, OpenTagMenu, convertTextToTags, getVoiceModel, CACHE_INVALIDATION } from "@/types/synthesis";
import { stripPhoneticMarkers } from "@/utils/phoneticMarkers";
import { synthesizeWithPolling } from "@/utils/synthesize";
import { useSynthesisOrchestrator } from "./synthesis/useSynthesisOrchestrator";
import { useTagEditor } from "./synthesis/useTagEditor";
import { usePlaylistControl } from "./synthesis/usePlaylistControl";
import { useTagUpdater } from "./synthesis/useTagUpdater";
import { useNotification } from "@/contexts/NotificationContext";

export function useSynthesis() {
  const { showNotification } = useNotification();
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

  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;

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

  const [editingTag, setEditingTag] = useState<EditingTag>(null);
  const [openTagMenu, setOpenTagMenu] = useState<OpenTagMenu>(null);

  const handleKeyDown = (e: React.KeyboardEvent, id: string): void => {
    tagEditor.handleKeyDown(e, id, (id: string, text?: string): void => {
      if (text) {
        synthesizeWithText(id, text);
      } else {
        synthesizeAndPlay(id);
      }
    });
  };

  const handleRemoveSentenceWrapper = useCallback(
    (id: string) => {
      handleRemoveSentence(id, true);
    },
    [handleRemoveSentence],
  );

  const handlePlay = useCallback(
    (id: string): void => {
      const sentence = getSentence(id);
      if (!sentence) return;
      if (sentence.currentInput.trim()) {
        const inputWords = convertTextToTags(sentence.currentInput);
        const allTags = [...sentence.tags, ...inputWords];
        const fullText = allTags.join(" ");
        updateSentence(id, {
          tags: allTags,
          currentInput: "",
          text: fullText,
          ...CACHE_INVALIDATION,
        });
        synthesizeWithText(id, fullText);
      } else if (sentence.tags.length > 0) {
        synthesizeAndPlay(id);
      }
    },
    [getSentence, updateSentence, synthesizeAndPlay, synthesizeWithText],
  );

  const handleDownload = useCallback(
    async (id: string) => {
      const sentence = getSentence(id);
      if (!sentence) return;
      let audioUrl = sentence.audioUrl;

      if (!audioUrl) {
        try {
          audioUrl = await synthesizeWithPolling(
            sentence.text,
            getVoiceModel(sentence.text),
          );
          updateSentence(id, { audioUrl });
        } catch (error) {
          console.error("Failed to generate audio:", error);
          return;
        }
      }

      if (!audioUrl) return;

      try {
        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();
        const blobUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${sentence.text || "audio"}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Failed to download audio:", error);
      }
    },
    [getSentence, updateSentence],
  );

  const handleCopyText = useCallback(
    async (id: string) => {
      const sentence = getSentence(id);
      if (!sentence || !sentence.text.trim()) return;

      try {
        await navigator.clipboard.writeText(sentence.text);
        showNotification(
          "success",
          "Tekst kopeeritud!",
          undefined,
          undefined,
          "success",
        );
      } catch (error) {
        console.error("Failed to copy text:", error);
        showNotification("error", "Viga teksti kopeerimisel");
      }
    },
    [getSentence, showNotification],
  );

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
      if (!sentence) return;
      const word = sentence.tags[tagIndex] ?? "";
      setEditingTag({ sentenceId, tagIndex, value: word });
      setOpenTagMenu(null);
    },
    [getSentence],
  );

  const handleEditTagChange = useCallback(
    (value: string) => {
      if (!editingTag) return;
      setEditingTag({ ...editingTag, value });
    },
    [editingTag],
  );

  const handleEditTagCommit = useCallback(() => {
    if (!editingTag) return;
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
              const newTags = [
                ...sentence.tags.slice(0, tagIndex),
                ...newWords,
                ...sentence.tags.slice(tagIndex + 1),
              ];
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

  return {
    sentences,
    setSentences,
    isPlayingAll: playlist.isPlayingAll,
    isLoadingPlayAll: playlist.isLoadingPlayAll,
    editingTag,
    openTagMenu,
    setOpenTagMenu,
    setDemoSentences,
    handleTextChange,
    handleClearSentence,
    handleAddSentence,
    handleRemoveSentence: handleRemoveSentenceWrapper,
    handleInputBlur,
    handleKeyDown,
    handlePlay,
    handlePlayAll: playlist.handlePlayAll,
    handleDownload,
    handleCopyText,
    handleDeleteTag,
    handleEditTag,
    handleEditTagChange,
    handleEditTagCommit,
    handleEditTagKeyDown,
    handleUseVariant,
    handleSentencePhoneticApply,
    synthesizeAndPlay,
  };
}
