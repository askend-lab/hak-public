// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { SentenceState, convertTextToTags, normalizeTags, CACHE_INVALIDATION } from "@/types/synthesis";
import { synthesizeAuto } from "@/features/synthesis/utils/synthesize";
import { copyTextToClipboard } from "@/utils/clipboardUtils";
import { logger } from "@hak/shared";
import { useNotification } from "@/contexts/NotificationContext";

async function downloadAudioBlob(audioUrl: string, text: string): Promise<void> {
  const audioResponse = await fetch(audioUrl);
  const audioBlob = await audioResponse.blob();
  const blobUrl = URL.createObjectURL(audioBlob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${(text || "audio").replace(/[<>:"/\\|?*\x00-\x1f\s]+/g, "_").slice(0, 80)}.wav`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

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

function stopPlayback(deps: UseSentenceActionsDeps, id: string): void {
  if (deps.playlist.isPlayingAll || deps.playlist.isLoadingPlayAll) {
    deps.playlist.handlePlayAll();
  } else {
    const audio = deps.currentAudio;
    if (audio) { audio.pause(); audio.src = ""; }
    deps.updateSentence(id, { isPlaying: false });
  }
}

function playWithInput(deps: UseSentenceActionsDeps, id: string, sentence: SentenceState): void {
  const allTags = normalizeTags([...sentence.tags, ...convertTextToTags(sentence.currentInput)]);
  const fullText = allTags.join(" ");
  deps.updateSentence(id, { tags: allTags, currentInput: "", text: fullText, ...CACHE_INVALIDATION });
  deps.synthesizeWithText(id, fullText);
}

export function useSentenceActions(deps: UseSentenceActionsDeps) {
  const { showNotification } = useNotification();

  const handlePlay = useCallback((id: string): void => {
    const sentence = deps.getSentence(id);
    if (!sentence) {return;}
    if (sentence.isPlaying) { stopPlayback(deps, id); return; }
    if (sentence.currentInput.trim()) { playWithInput(deps, id, sentence); }
    else if (sentence.tags.length > 0) { deps.synthesizeAndPlay(id); }
  }, [deps]);

  const handleDownload = useCallback(async (id: string) => {
    const sentence = deps.getSentence(id);
    if (!sentence) {return;}
    let audioUrl = sentence.audioUrl;
    if (!audioUrl) {
      try { const result = await synthesizeAuto(sentence.text); audioUrl = result.audioUrl; deps.updateSentence(id, { audioUrl }); }
      catch (error) { logger.error("Failed to generate audio:", error); return; }
    }
    if (audioUrl) { try { await downloadAudioBlob(audioUrl, sentence.text); } catch (error) { logger.error("Failed to download audio:", error); } }
  }, [deps]);

  const handleCopyText = useCallback(async (id: string) => {
    const sentence = deps.getSentence(id);
    if (sentence?.text.trim()) { await copyTextToClipboard(sentence.text, showNotification); }
  }, [deps, showNotification]);

  return {
    handlePlay, handleDownload, handleCopyText,
    handleRemoveSentence: useCallback((id: string) => { deps.handleRemoveSentence(id, true); }, [deps]),
  };
}
