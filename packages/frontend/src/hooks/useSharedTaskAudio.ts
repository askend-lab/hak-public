// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { TaskEntry, hasAudioSource, getEntryPlayUrl } from "@/types/task";
import { synthesizeWithPolling } from "@/features/synthesis/utils/synthesize";
import { getVoiceModel } from "@/types/synthesis";

interface UseSharedTaskAudioReturn {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string, entries: TaskEntry[]) => void;
  handlePlayAll: (entries: TaskEntry[]) => Promise<void>;
}

export function useSharedTaskAudio(): UseSharedTaskAudioReturn {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentLoadingId, setCurrentLoadingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] =
    useState<AbortController | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  const synthesizeAndPlay = useCallback(
    async (stressedText: string, originalText: string, id: string) => {
      setCurrentLoadingId(id);
      setCurrentPlayingId(null);

      try {
        const audioUrl = await synthesizeWithPolling(
          stressedText,
          getVoiceModel(originalText),
        );
        const audio = new Audio(audioUrl);

        audio.onloadeddata = (): void => {
          setCurrentLoadingId(null);
          setCurrentPlayingId(id);
        };

        audio.onended = (): void => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = (): void => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch {
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
      }
    },
    [],
  );

  const handlePlayEntry = useCallback(
    (id: string, entries: TaskEntry[]) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;

      if (hasAudioSource(entry)) {
        setCurrentPlayingId(id);
        const playResult = getEntryPlayUrl(entry);
        if (playResult) {
          const playUrl = playResult.url;
          const audio = new Audio(playUrl);
          audio.onended = (): void => {
            setCurrentPlayingId(null);
            if (playResult.shouldRevoke) URL.revokeObjectURL(playUrl);
          };
          audio.onerror = (): void => {
            if (playResult.shouldRevoke) URL.revokeObjectURL(playUrl);
            synthesizeAndPlay(entry.stressedText, entry.text, id);
          };
          audio.play().catch(() => {
            if (playResult.shouldRevoke) URL.revokeObjectURL(playUrl);
            synthesizeAndPlay(entry.stressedText, entry.text, id);
          });
        }
      } else {
        synthesizeAndPlay(entry.stressedText, entry.text, id);
      }
    },
    [synthesizeAndPlay],
  );

  const playSingleEntry = useCallback(
    async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
      if (abortSignal.aborted) return false;

      let audioUrl: string | null = null;
      let shouldRevokeUrl = false;

      try {
        const cachedAudio = getEntryPlayUrl(entry);
        if (cachedAudio) {
          audioUrl = cachedAudio.url;
          shouldRevokeUrl = cachedAudio.shouldRevoke;
        } else {
          setCurrentLoadingId(entry.id);
          try {
            audioUrl = await synthesizeWithPolling(
              entry.stressedText,
              getVoiceModel(entry.text),
            );
            if (abortSignal.aborted) {
              setCurrentLoadingId(null);
              return false;
            }
          } catch {
            setCurrentLoadingId(null);
            return false;
          }
        }

        if (!audioUrl || abortSignal.aborted) return false;

        const finalAudioUrl = audioUrl;
        return new Promise((resolve) => {
          const audio = new Audio(finalAudioUrl);
          setCurrentAudio(audio);

          const cleanup = (): void => {
            setCurrentPlayingId(null);
            setCurrentLoadingId(null);
            setCurrentAudio(null);
            if (shouldRevokeUrl && audioUrl) URL.revokeObjectURL(audioUrl);
          };

          audio.onloadeddata = (): void => {
            setCurrentLoadingId(null);
            setCurrentPlayingId(entry.id);
          };

          audio.onended = (): void => {
            cleanup();
            resolve(true);
          };
          audio.onerror = (): void => {
            cleanup();
            resolve(false);
          };

          abortSignal.addEventListener("abort", () => {
            audio.pause();
            audio.src = "";
            cleanup();
            resolve(false);
          });

          audio.play().catch(() => {
            cleanup();
            resolve(false);
          });
        });
      } catch {
        setCurrentLoadingId(null);
        setCurrentPlayingId(null);
        if (shouldRevokeUrl && audioUrl) URL.revokeObjectURL(audioUrl);
        return false;
      }
    },
    [],
  );

  const handlePlayAll = useCallback(
    async (entries: TaskEntry[]) => {
      if (isPlayingAll || isLoadingPlayAll) {
        playAllAbortController?.abort();
        setPlayAllAbortController(null);
        setIsPlayingAll(false);
        setIsLoadingPlayAll(false);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.src = "";
          setCurrentAudio(null);
        }
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        return;
      }

      if (entries.length === 0) return;

      const abortController = new AbortController();
      setPlayAllAbortController(abortController);
      setIsLoadingPlayAll(true);

      let isFirstEntry = true;
      for (const entry of entries) {
        if (abortController.signal.aborted) break;

        const success = await playSingleEntry(entry, abortController.signal);

        if (isFirstEntry && success) {
          setIsLoadingPlayAll(false);
          setIsPlayingAll(true);
          isFirstEntry = false;
        }

        if (!success || abortController.signal.aborted) break;
      }

      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      setPlayAllAbortController(null);
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
    },
    [
      isPlayingAll,
      isLoadingPlayAll,
      playAllAbortController,
      currentAudio,
      playSingleEntry,
    ],
  );

  return {
    currentPlayingId,
    currentLoadingId,
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayEntry,
    handlePlayAll,
  };
}
