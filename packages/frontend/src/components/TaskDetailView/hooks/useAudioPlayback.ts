// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback } from "react";
import { TaskEntry } from "@/types/task";
import { synthesizeWithPolling } from "@/utils/synthesize";
import { getVoiceModel } from "@/types/synthesis";

interface UseAudioPlaybackReturn {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string) => void;
  handlePlayAll: () => Promise<void>;
}

export function useAudioPlayback(entries: TaskEntry[]): UseAudioPlaybackReturn {
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

        audio.onloadeddata = () => {
          setCurrentLoadingId(null);
          setCurrentPlayingId(id);
        };

        audio.onended = () => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
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
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;

      if (
        (entry.audioBlob && entry.audioBlob.size > 0) ||
        (entry.audioUrl && entry.audioUrl.trim() !== "")
      ) {
        setCurrentPlayingId(id);
        const playUrl = entry.audioBlob
          ? URL.createObjectURL(entry.audioBlob)
          : entry.audioUrl;
        if (playUrl) {
          const audio = new Audio(playUrl);
          audio.onended = () => {
            setCurrentPlayingId(null);
            if (entry.audioBlob && playUrl !== entry.audioUrl)
              URL.revokeObjectURL(playUrl);
          };
          audio.onerror = () => {
            if (entry.audioBlob && playUrl !== entry.audioUrl)
              URL.revokeObjectURL(playUrl);
            synthesizeAndPlay(entry.stressedText, entry.text, id);
          };
          audio.play().catch(() => {
            if (entry.audioBlob && playUrl !== entry.audioUrl)
              URL.revokeObjectURL(playUrl);
            synthesizeAndPlay(entry.stressedText, entry.text, id);
          });
        }
      } else {
        synthesizeAndPlay(entry.stressedText, entry.text, id);
      }
    },
    [entries, synthesizeAndPlay],
  );

  const playSingleEntry = useCallback(
    async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
      if (abortSignal.aborted) return false;

      let audioUrl: string | null = null;
      let shouldRevokeUrl = false;

      try {
        if (entry.audioBlob && entry.audioBlob.size > 0) {
          audioUrl = URL.createObjectURL(entry.audioBlob);
          shouldRevokeUrl = true;
        } else if (entry.audioUrl && entry.audioUrl.trim() !== "") {
          audioUrl = entry.audioUrl;
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

        return new Promise((resolve) => {
          const validUrl = audioUrl ?? "";
          const audio = new Audio(validUrl);
          setCurrentAudio(audio);

          const cleanup = () => {
            setCurrentPlayingId(null);
            setCurrentLoadingId(null);
            setCurrentAudio(null);
            if (shouldRevokeUrl && audioUrl) URL.revokeObjectURL(audioUrl);
          };

          audio.onloadeddata = () => {
            setCurrentLoadingId(null);
            setCurrentPlayingId(entry.id);
          };

          audio.onended = () => {
            cleanup();
            resolve(true);
          };
          audio.onerror = () => {
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

  const handlePlayAll = useCallback(async () => {
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
  }, [
    entries,
    isPlayingAll,
    isLoadingPlayAll,
    playAllAbortController,
    currentAudio,
    playSingleEntry,
  ]);

  return {
    currentPlayingId,
    currentLoadingId,
    isPlayingAll,
    isLoadingPlayAll,
    handlePlayEntry,
    handlePlayAll,
  };
}
