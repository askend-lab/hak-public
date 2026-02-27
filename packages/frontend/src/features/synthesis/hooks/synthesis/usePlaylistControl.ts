// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";

export function usePlaylistControl(
  sentences: SentenceState[],
  playSingle: (id: string, abortSignal?: AbortSignal) => Promise<boolean>,
  stopAudio: () => void,
  updateAllSentences: (updates: Partial<SentenceState>) => void,
): {
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayAll: () => Promise<void>;
} {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] =
    useState<AbortController | null>(null);

  const stopAll = useCallback(() => {
    playAllAbortController?.abort();
    setPlayAllAbortController(null);
    setIsPlayingAll(false);
    setIsLoadingPlayAll(false);
    stopAudio();
    updateAllSentences({ isPlaying: false, isLoading: false });
  }, [playAllAbortController, stopAudio, updateAllSentences]);

  const playSequence = useCallback(async (sentencesWithText: SentenceState[]) => {
    const abortController = new AbortController();
    setPlayAllAbortController(abortController);
    setIsLoadingPlayAll(true);
    let isFirst = true;
    for (const sentence of sentencesWithText) {
      if (abortController.signal.aborted) {break;}
      const success = await playSingle(sentence.id, abortController.signal); // eslint-disable-line no-await-in-loop -- sequential playback
      if (isFirst && success) { setIsLoadingPlayAll(false); setIsPlayingAll(true); isFirst = false; }
      if (!success || abortController.signal.aborted) {break;}
    }
    setIsPlayingAll(false); setIsLoadingPlayAll(false); setPlayAllAbortController(null);
  }, [playSingle]);

  const handlePlayAll = useCallback(async () => {
    if (isPlayingAll || isLoadingPlayAll) { stopAll(); return; }
    const sentencesWithText = filterNonEmptySentences(sentences);
    if (sentencesWithText.length === 0) {return;}
    await playSequence(sentencesWithText);
  }, [isPlayingAll, isLoadingPlayAll, stopAll, sentences, playSequence]);

  return {
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayAll,
  };
}
