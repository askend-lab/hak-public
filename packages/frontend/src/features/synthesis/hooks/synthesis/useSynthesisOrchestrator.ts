// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback, useRef, useMemo } from "react";
import { useSentenceState } from "./useSentenceState";
import { useAudioPlayer } from "./useAudioPlayer";
import { useSynthesisAPI } from "./useSynthesisAPI";
import { type OrchestratorDeps, doPlaySingle, doSynthesizeAndPlay, doSynthesizeWithText } from "./orchestratorHelpers";

function useDeps(state: ReturnType<typeof useSentenceState>, audio: ReturnType<typeof useAudioPlayer>, synthesisAPI: ReturnType<typeof useSynthesisAPI>): OrchestratorDeps {
  const sentencesRef = useRef(state.sentences);
  sentencesRef.current = state.sentences;
  return useMemo(() => ({
    getSentence: state.getSentence, updateSentence: state.updateSentence, synthesisAPI,
    playAudio: audio.playAudio, playWithAbort: audio.playWithAbort,
    stopCurrentAudio: audio.stopCurrentAudio, sentencesRef,
  }), [state.getSentence, state.updateSentence, synthesisAPI, audio.playAudio, audio.playWithAbort, audio.stopCurrentAudio]);
}

export function useSynthesisOrchestrator(): ReturnType<typeof useSentenceState> & {
  currentAudio: HTMLAudioElement | null;
  playSingleSentence: (id: string, abortSignal?: AbortSignal, retryCount?: number) => Promise<boolean>;
  synthesizeAndPlay: (id: string) => Promise<void>;
  synthesizeWithText: (id: string, text: string) => Promise<void>;
} {
  const state = useSentenceState();
  const audio = useAudioPlayer();
  const deps = useDeps(state, audio, useSynthesisAPI());
  const playSingleSentence = useCallback((id: string, signal?: AbortSignal, retry = 0) => doPlaySingle(deps, { id, abortSignal: signal, retryCount: retry }), [deps]);
  const synthesizeAndPlay = useCallback((id: string) => doSynthesizeAndPlay(deps, id), [deps]);
  const synthesizeWithText = useCallback((id: string, text: string) => doSynthesizeWithText(deps, { id, text }), [deps]);
  return { ...state, currentAudio: audio.currentAudio, playSingleSentence, synthesizeAndPlay, synthesizeWithText };
}
