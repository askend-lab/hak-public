// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared audio playback utility to eliminate DRY violations
 * across PronunciationVariants, SentencePhoneticPanel, useAudioPlayback, and useSynthesis
 */

export interface AudioPlayCallbacks {
  onLoaded?: (() => void) | undefined;
  onEnded?: (() => void) | undefined;
  onError?: (() => void) | undefined;
}

export interface AudioPlayResult {
  audio: HTMLAudioElement;
  cleanup: () => void;
}

/**
 * Creates and configures an audio element with standard event handlers.
 * Automatically revokes the URL on ended/error if shouldRevokeUrl is true.
 *
 * @param audioUrl - URL to play (can be blob URL or regular URL)
 * @param callbacks - Event callbacks for loaded, ended, error
 * @param shouldRevokeUrl - Whether to revoke the URL on cleanup (default: true)
 * @returns Audio element and cleanup function
 */
export function createAudioPlayer(
  audioUrl: string,
  callbacks: AudioPlayCallbacks = {},
  shouldRevokeUrl = true,
): AudioPlayResult {
  const audio = new Audio(audioUrl);

  const cleanup = (): void => {
    if (shouldRevokeUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  audio.onloadeddata = (): void => {
    callbacks.onLoaded?.();
  };

  audio.onended = (): void => {
    cleanup();
    callbacks.onEnded?.();
  };

  audio.onerror = (): void => {
    cleanup();
    callbacks.onError?.();
  };

  return { audio, cleanup };
}

/**
 * Plays audio with standard loading/playing/ended state management.
 * Returns a promise that resolves when audio ends or rejects on error.
 */
export async function playAudioWithCallbacks(
  audioUrl: string,
  callbacks: AudioPlayCallbacks = {},
  shouldRevokeUrl = true,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { audio } = createAudioPlayer(
      audioUrl,
      {
        onLoaded: callbacks.onLoaded,
        onEnded: () => {
          callbacks.onEnded?.();
          resolve();
        },
        onError: () => {
          callbacks.onError?.();
          reject(new Error("Audio playback failed"));
        },
      },
      shouldRevokeUrl,
    );

    audio.play().catch(reject);
  });
}
