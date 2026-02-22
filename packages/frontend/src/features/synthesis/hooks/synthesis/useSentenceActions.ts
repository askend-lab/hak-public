// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { SentenceState, convertTextToTags, normalizeTags, CACHE_INVALIDATION } from "@/types/synthesis";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";
import { copyTextToClipboard } from "@/utils/clipboardUtils";
import { logger } from "@hak/shared";
import { useNotification } from "@/contexts/NotificationContext";

interface UseSentenceActionsDeps {
  getSentence: (id: string) => SentenceState | undefined;
  updateSentence: (id: string, updates: Partial<SentenceState>) => void;
  synthesizeAndPlay: (id: string) => void;
  synthesizeWithText: (id: string, text: string) => void;
  handleRemoveSentence: (id: string, keepMinimum?: boolean) => void;
  currentAudio: HTMLAudioElement | null;
  playlist: {
    isPlayingAll: boolean;
    isLoadingPlayAll: boolean;
    handlePlayAll: () => void;
  };
}

export function useSentenceActions({
  getSentence,
  updateSentence,
  synthesizeAndPlay,
  synthesizeWithText,
  handleRemoveSentence,
  currentAudio,
  playlist,
}: UseSentenceActionsDeps) {
  const { showNotification } = useNotification();

  const handleRemoveSentenceWrapper = useCallback(
    (id: string) => {
      handleRemoveSentence(id, true);
    },
    [handleRemoveSentence],
  );

  const handlePlay = useCallback(
    (id: string): void => {
      const sentence = getSentence(id);
      if (!sentence) {return;}
      // If sentence is already playing, stop it (pause behavior)
      if (sentence.isPlaying) {
        if (playlist.isPlayingAll || playlist.isLoadingPlayAll) {
          // Stop the entire play-all sequence
          playlist.handlePlayAll();
        } else {
          // Stop individual playback
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.src = ""; // eslint-disable-line no-param-reassign -- clearing audio source to stop playback
          }
          updateSentence(id, { isPlaying: false });
        }
        return;
      }

      if (sentence.currentInput.trim()) {
        const inputWords = convertTextToTags(sentence.currentInput);
        const allTags = normalizeTags([...sentence.tags, ...inputWords]);
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
    [getSentence, updateSentence, synthesizeAndPlay, synthesizeWithText, currentAudio, playlist],
  );

  const handleDownload = useCallback(
    async (id: string) => {
      const sentence = getSentence(id);
      if (!sentence) {return;}
      let audioUrl = sentence.audioUrl;

      if (!audioUrl) {
        try {
          audioUrl = await synthesizeAuto(sentence.text);
          updateSentence(id, { audioUrl });
        } catch (error) {
          logger.error("Failed to generate audio:", error);
          return;
        }
      }

      if (!audioUrl) {return;}

      try {
        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();
        const blobUrl = URL.createObjectURL(audioBlob);
        const a = document.createElement("a");
        a.href = blobUrl;
        const safeName = (sentence.text || "audio").replace(/[<>:"/\\|?*\x00-\x1f\s]+/g, "_").slice(0, 80);
        a.download = `${safeName}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        logger.error("Failed to download audio:", error);
      }
    },
    [getSentence, updateSentence],
  );

  const handleCopyText = useCallback(
    async (id: string) => {
      const sentence = getSentence(id);
      if (!sentence || !sentence.text.trim()) {return;}

      await copyTextToClipboard(sentence.text, showNotification);
    },
    [getSentence, showNotification],
  );

  return {
    handlePlay,
    handleDownload,
    handleCopyText,
    handleRemoveSentence: handleRemoveSentenceWrapper,
  };
}
