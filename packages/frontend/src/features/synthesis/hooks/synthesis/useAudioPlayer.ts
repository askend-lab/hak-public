// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";

interface PlayCallbacks { onLoadStart?: () => void; onLoadComplete?: () => void; onEnded?: () => void; onError?: () => void; }
interface AbortCallbacks { onStart?: () => void; onEnded?: () => void; onError?: () => void; }

function createPlayPromise(setAudio: (a: HTMLAudioElement | null) => void, audioUrl: string, cb: PlayCallbacks): Promise<boolean> {
  return new Promise((resolve): void => {
    const audio = new Audio(audioUrl); setAudio(audio);
    cb.onLoadStart?.();
    audio.onloadeddata = () => { cb.onLoadComplete?.(); };
    audio.onended = () => { setAudio(null); cb.onEnded?.(); resolve(true); };
    audio.onerror = () => { setAudio(null); cb.onError?.(); resolve(false); };
    audio.play().catch(() => { setAudio(null); cb.onError?.(); resolve(false); });
  });
}

function createAbortPlayPromise(opts: { setAudio: (a: HTMLAudioElement | null) => void; audioUrl: string; signal: AbortSignal; cb: AbortCallbacks }): Promise<boolean> {
  if (opts.signal.aborted) {return Promise.resolve(false);}
  const { setAudio, audioUrl, signal, cb } = opts;
  return new Promise((resolve): void => {
    const audio = new Audio(audioUrl); setAudio(audio); cb.onStart?.();
    const cleanup = () => { setAudio(null); signal.removeEventListener("abort", onAbort); };
    const onAbort = () => { audio.pause(); cleanup(); resolve(false); };
    audio.onended = () => { cleanup(); cb.onEnded?.(); resolve(true); };
    audio.onerror = () => { cleanup(); cb.onError?.(); resolve(false); };
    signal.addEventListener("abort", onAbort);
    audio.play().catch(() => { cleanup(); cb.onError?.(); resolve(false); });
  });
}

export type AudioAPI = ReturnType<typeof useAudioPlayer>;

export function useAudioPlayer() {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; setCurrentAudio(null); }
  }, [currentAudio]);

  const playAudio = useCallback((audioUrl: string, callbacks: PlayCallbacks = {}): Promise<boolean> => {
    return createPlayPromise(setCurrentAudio, audioUrl, callbacks);
  }, []);

  const playWithAbort = useCallback((audioUrl: string, abortSignal: AbortSignal, callbacks: AbortCallbacks = {}): Promise<boolean> => {
    return createAbortPlayPromise({ setAudio: setCurrentAudio, audioUrl, signal: abortSignal, cb: callbacks });
  }, []);

  return { currentAudio, stopCurrentAudio, playAudio, playWithAbort };
}
