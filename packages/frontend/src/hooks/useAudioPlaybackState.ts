// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useReducer } from "react";

export interface AudioPlaybackState {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  abortController: AbortController | null;
  currentAudio: HTMLAudioElement | null;
}

export type AudioAction =
  | { type: "SET_PLAYING"; id: string }
  | { type: "SET_LOADING"; id: string }
  | { type: "CLEAR_PLAYING" }
  | { type: "CLEAR_LOADING" }
  | { type: "CLEAR_BOTH" }
  | { type: "SET_AUDIO"; audio: HTMLAudioElement }
  | { type: "CLEAR_AUDIO" }
  | { type: "START_PLAY_ALL"; abortController: AbortController }
  | { type: "FIRST_SUCCESS" }
  | { type: "RESET" };

const INITIAL_STATE: AudioPlaybackState = {
  currentPlayingId: null,
  currentLoadingId: null,
  isPlayingAll: false,
  isLoadingPlayAll: false,
  abortController: null,
  currentAudio: null,
};

const ACTION_MAP: Record<string, (state: AudioPlaybackState, action: AudioAction) => AudioPlaybackState> = {
  SET_PLAYING: (s, a) => ({ ...s, currentPlayingId: (a as { id: string }).id }),
  SET_LOADING: (s, a) => ({ ...s, currentLoadingId: (a as { id: string }).id, currentPlayingId: null }),
  CLEAR_PLAYING: (s) => ({ ...s, currentPlayingId: null }),
  CLEAR_LOADING: (s) => ({ ...s, currentLoadingId: null }),
  CLEAR_BOTH: (s) => ({ ...s, currentPlayingId: null, currentLoadingId: null }),
  SET_AUDIO: (s, a) => ({ ...s, currentAudio: (a as { audio: HTMLAudioElement }).audio }),
  CLEAR_AUDIO: (s) => ({ ...s, currentAudio: null, currentPlayingId: null, currentLoadingId: null }),
  START_PLAY_ALL: (s, a) => ({ ...s, isLoadingPlayAll: true, abortController: (a as { abortController: AbortController }).abortController }),
  FIRST_SUCCESS: (s) => ({ ...s, isLoadingPlayAll: false, isPlayingAll: true }),
  RESET: () => INITIAL_STATE,
};

function reducer(state: AudioPlaybackState, action: AudioAction): AudioPlaybackState {
  const handler = ACTION_MAP[action.type];
  return handler ? handler(state, action) : state;
}

export function useAudioPlaybackState(): [AudioPlaybackState, React.Dispatch<AudioAction>] {
  return useReducer(reducer, INITIAL_STATE);
}
