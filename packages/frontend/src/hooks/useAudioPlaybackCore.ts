// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback, useRef } from "react";
import { TaskEntry, hasAudioSource, getEntryPlayUrl } from "@/types/task";
import type { AudioPlaybackState, AudioAction } from "./useAudioPlaybackState";
import { useAudioPlaybackState } from "./useAudioPlaybackState";
import { resolveEntryAudioUrl, playAudioWithPromise, synthesizeAndCreateAudio } from "./audioPlaybackHelpers";

type Dispatch = React.Dispatch<AudioAction>;
type PlayFn = (entry: TaskEntry, signal: AbortSignal) => Promise<boolean>;

function stopCurrentPlayback(state: AudioPlaybackState, dispatch: Dispatch): void {
  const { abortController, currentAudio } = state;
  if (abortController) {abortController.abort();}
  if (currentAudio) {currentAudio.pause(); currentAudio.src = "";}
  dispatch({ type: "RESET" });
}

interface PlayAllInput {
  entries: TaskEntry[];
  controller: AbortController;
  playSingle: PlayFn;
  continueOnFailure: boolean;
  dispatch: Dispatch;
}

function shouldStopLoop(controller: AbortController, continueOnFailure: boolean, success: boolean): boolean {
  return controller.signal.aborted || (!continueOnFailure && !success);
}

async function playEntriesSequentially(input: PlayAllInput): Promise<void> {
  let isFirst = true;
  for (const entry of input.entries) {
    if (input.controller.signal.aborted) {break;}
    const ok = await input.playSingle(entry, input.controller.signal); // eslint-disable-line no-await-in-loop -- sequential playback
    if (isFirst && ok) { input.dispatch({ type: "FIRST_SUCCESS" }); isFirst = false; }
    if (shouldStopLoop(input.controller, input.continueOnFailure, ok)) {break;}
  }
}

function usePlayEntry(logPrefix: string, dispatch: Dispatch): (id: string, entries: TaskEntry[]) => void {
  return useCallback(
    (id: string, entries: TaskEntry[]) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) {return;}
      if (hasAudioSource(entry)) {
        dispatch({ type: "SET_PLAYING", id });
        const playResult = getEntryPlayUrl(entry);
        if (playResult) {synthesizeAndCreateAudio({ entry, id, playResult, logPrefix, dispatch });}
      } else {
        void synthesizeAndCreateAudio({ entry, id, playResult: null, logPrefix, dispatch });
      }
    },
    [logPrefix, dispatch],
  );
}

function useSingleEntryPlayer(logPrefix: string, dispatch: Dispatch): PlayFn {
  return useCallback(
    async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
      if (abortSignal.aborted) {return false;}
      const resolved = await resolveEntryAudioUrl(entry, abortSignal, dispatch);
      if (!resolved || abortSignal.aborted) {return false;}
      return playAudioWithPromise({ ...resolved, entryId: entry.id, abortSignal, logPrefix, dispatch });
    },
    [logPrefix, dispatch],
  );
}

export function useAudioPlaybackCore(options: { continueOnFailure?: boolean; logPrefix?: string } = {}): {
  currentPlayingId: string | null; currentLoadingId: string | null;
  isPlayingAll: boolean; isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string, entries: TaskEntry[]) => void;
  handlePlayAll: (entries: TaskEntry[]) => Promise<void>;
} {
  const { continueOnFailure = false, logPrefix = "Audio" } = options;
  const [state, dispatch] = useAudioPlaybackState();
  const stateRef = useRef(state);
  stateRef.current = state;
  const handlePlayEntry = usePlayEntry(logPrefix, dispatch);
  const playSingle = useSingleEntryPlayer(logPrefix, dispatch);
  const handlePlayAll = useCallback(
    async (entries: TaskEntry[]) => {
      if (stateRef.current.isPlayingAll || stateRef.current.isLoadingPlayAll) { stopCurrentPlayback(stateRef.current, dispatch); return; }
      if (entries.length === 0) {return;}
      const controller = new AbortController();
      dispatch({ type: "START_PLAY_ALL", abortController: controller });
      await playEntriesSequentially({ entries, controller, playSingle, continueOnFailure, dispatch });
      dispatch({ type: "RESET" });
    },
    [playSingle, continueOnFailure, dispatch],
  );
  return {
    currentPlayingId: state.currentPlayingId, currentLoadingId: state.currentLoadingId,
    isPlayingAll: state.isPlayingAll, isLoadingPlayAll: state.isLoadingPlayAll,
    handlePlayEntry, handlePlayAll,
  };
}
