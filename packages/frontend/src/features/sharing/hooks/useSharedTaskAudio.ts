// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { TaskEntry } from "@/types/task";
import { useAudioPlaybackCore } from "@/hooks/useAudioPlaybackCore";

interface UseSharedTaskAudioReturn {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string, entries: TaskEntry[]) => void;
  handlePlayAll: (entries: TaskEntry[]) => Promise<void>;
}

export function useSharedTaskAudio(): UseSharedTaskAudioReturn {
  return useAudioPlaybackCore({
    continueOnFailure: true,
    logPrefix: "Shared task audio",
  });
}
