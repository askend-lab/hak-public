// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";

interface PlaylistDeps {
  sentences: SentenceState[];
  playSingle: (id: string, abortSignal?: AbortSignal) => Promise<boolean>;
  stopAudio: () => void;
  updateAllSentences: (updates: Partial<SentenceState>) => void;
}

export function usePlaylistControl(deps: PlaylistDeps): {
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayAll: () => Promise<void>;
} {
  const { sentences, playSingle, stopAudio, updateAllSentences } = deps;
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);

  const stopAll = useCallback(() => {
    abortCtrl?.abort(); setAbortCtrl(null);
    setIsPlayingAll(false); setIsLoadingPlayAll(false);
    stopAudio(); updateAllSentences({ isPlaying: false, isLoading: false });
  }, [abortCtrl, stopAudio, updateAllSentences]);

  const resetPlayState = useCallback(() => {
    setIsPlayingAll(false); setIsLoadingPlayAll(false); setAbortCtrl(null);
  }, []);

  const playSequence = useCallback(async (items: SentenceState[]) => {
    const ctrl = new AbortController();
    setAbortCtrl(ctrl); setIsLoadingPlayAll(true);
    let started = false;
    for (const s of items) {
      if (ctrl.signal.aborted) {break;}
      const ok = await playSingle(s.id, ctrl.signal); // eslint-disable-line no-await-in-loop -- sequential playback
      if (!started && ok) { setIsLoadingPlayAll(false); setIsPlayingAll(true); started = true; }
      if (!ok) {break;}
    }
    resetPlayState();
  }, [playSingle, resetPlayState]);

  const handlePlayAll = useCallback(async () => {
    if (isPlayingAll || isLoadingPlayAll) { stopAll(); return; }
    const items = filterNonEmptySentences(sentences);
    if (items.length > 0) { await playSequence(items); }
  }, [isPlayingAll, isLoadingPlayAll, stopAll, sentences, playSequence]);

  return {
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayAll,
  };
}
