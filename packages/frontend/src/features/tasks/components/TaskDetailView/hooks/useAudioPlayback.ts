// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { TaskEntry } from "@/types/task";
import { useAudioPlaybackCore } from "@/hooks/useAudioPlaybackCore";

interface UseAudioPlaybackReturn {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string) => void;
  handlePlayAll: () => Promise<void>;
}

export function useAudioPlayback(entries: TaskEntry[]): UseAudioPlaybackReturn {
  const core = useAudioPlaybackCore({
    continueOnFailure: false,
    logPrefix: "Task audio",
  });

  const handlePlayEntry = useCallback(
    (id: string) => {
      core.handlePlayEntry(id, entries);
    },
    [core.handlePlayEntry, entries],
  );

  const handlePlayAll = useCallback(
    async () => {
      await core.handlePlayAll(entries);
    },
    [core.handlePlayAll, entries],
  );

  return {
    currentPlayingId: core.currentPlayingId,
    currentLoadingId: core.currentLoadingId,
    isPlayingAll: core.isPlayingAll,
    isLoadingPlayAll: core.isLoadingPlayAll,
    handlePlayEntry,
    handlePlayAll,
  };
}
