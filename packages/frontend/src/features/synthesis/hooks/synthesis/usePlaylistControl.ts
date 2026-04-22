// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { SentenceState, filterNonEmptySentences } from "@/types/synthesis";
import { useSentenceStore } from "./useSentenceState";

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
  const isPlayingAll = useSentenceStore((s) => s.isPlayingAll);
  const isLoadingPlayAll = useSentenceStore((s) => s.isLoadingPlayAll);
  const setIsPlayingAll = useSentenceStore((s) => s.setIsPlayingAll);
  const setIsLoadingPlayAll = useSentenceStore((s) => s.setIsLoadingPlayAll);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);

  const stopAll = useCallback(() => {
    abortCtrl?.abort(); setAbortCtrl(null);
    setIsPlayingAll(false); setIsLoadingPlayAll(false);
    stopAudio(); updateAllSentences({ isPlaying: false, isLoading: false });
  }, [abortCtrl, stopAudio, updateAllSentences, setIsPlayingAll, setIsLoadingPlayAll]);

  const resetPlayState = useCallback(() => {
    setIsPlayingAll(false); setIsLoadingPlayAll(false); setAbortCtrl(null);
  }, [setIsPlayingAll, setIsLoadingPlayAll]);

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
  }, [playSingle, resetPlayState, setIsLoadingPlayAll, setIsPlayingAll]);

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
