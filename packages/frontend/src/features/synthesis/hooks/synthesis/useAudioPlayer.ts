// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";

export function useAudioPlayer(): {
  currentAudio: HTMLAudioElement | null;
  stopCurrentAudio: () => void;
  playAudio: (
    audioUrl: string,
    callbacks?: {
      onLoadStart?: () => void;
      onLoadComplete?: () => void;
      onEnded?: () => void;
      onError?: () => void;
    },
  ) => Promise<boolean>;
  playWithAbort: (
    audioUrl: string,
    abortSignal: AbortSignal,
    callbacks?: {
      onStart?: () => void;
      onEnded?: () => void;
      onError?: () => void;
    },
  ) => Promise<boolean>;
} {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  const stopCurrentAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      setCurrentAudio(null);
    }
  }, [currentAudio]);

  const playAudio = useCallback(
    (
      audioUrl: string,
      callbacks: {
        onLoadStart?: () => void;
        onLoadComplete?: () => void;
        onEnded?: () => void;
        onError?: () => void;
      } = {},
    ): Promise<boolean> => {
      return new Promise((resolve): void => {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        if (callbacks.onLoadStart) {
          callbacks.onLoadStart();
        }

        audio.onloadeddata = (): void => {
          if (callbacks.onLoadComplete) {
            callbacks.onLoadComplete();
          }
        };

        audio.onended = (): void => {
          setCurrentAudio(null);
          if (callbacks.onEnded) {
            callbacks.onEnded();
          }
          resolve(true);
        };

        audio.onerror = (): void => {
          setCurrentAudio(null);
          if (callbacks.onError) {
            callbacks.onError();
          }
          resolve(false);
        };

        audio.play().catch((): void => {
          setCurrentAudio(null);
          if (callbacks.onError) {
            callbacks.onError();
          }
          resolve(false);
        });
      });
    },
    [],
  );

  const playWithAbort = useCallback(
    (
      audioUrl: string,
      abortSignal: AbortSignal,
      callbacks: {
        onStart?: () => void;
        onEnded?: () => void;
        onError?: () => void;
      } = {},
    ): Promise<boolean> => {
      if (abortSignal.aborted) {return Promise.resolve(false);}

      return new Promise((resolve): void => {
        const audio = new Audio(audioUrl);
        setCurrentAudio(audio);

        if (callbacks.onStart) {
          callbacks.onStart();
        }

        const cleanup = (): void => {
          setCurrentAudio(null);
          abortSignal.removeEventListener("abort", onAbort);
        };

        const onAbort = (): void => {
          audio.pause();
          cleanup();
          resolve(false);
        };

        audio.onended = (): void => {
          cleanup();
          if (callbacks.onEnded) {
            callbacks.onEnded();
          }
          resolve(true);
        };

        audio.onerror = (): void => {
          cleanup();
          if (callbacks.onError) {
            callbacks.onError();
          }
          resolve(false);
        };

        abortSignal.addEventListener("abort", onAbort);

        audio.play().catch((): void => {
          cleanup();
          if (callbacks.onError) {
            callbacks.onError();
          }
          resolve(false);
        });
      });
    },
    [],
  );

  return {
    currentAudio,
    stopCurrentAudio,
    playAudio,
    playWithAbort,
  };
}
