// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useCallback, useRef } from "react";
import { logger } from "@hak/shared";
import { TaskEntry, hasAudioSource, getEntryPlayUrl } from "@/types/task";
import { synthesizeWithPolling } from "@/features/synthesis/utils/synthesize";
import { getVoiceModel } from "@/types/synthesis";

function revokeAndLog(url: string, prefix: string, reason: string): void {
  URL.revokeObjectURL(url);
  logger.debug(`${prefix} cleanup: revoked URL (${reason})`);
}

interface AudioPlaybackCoreOptions {
  continueOnFailure?: boolean;
  logPrefix?: string;
}

interface AudioPlaybackCoreReturn {
  currentPlayingId: string | null;
  currentLoadingId: string | null;
  isPlayingAll: boolean;
  isLoadingPlayAll: boolean;
  handlePlayEntry: (id: string, entries: TaskEntry[]) => void;
  handlePlayAll: (entries: TaskEntry[]) => Promise<void>;
}

export function useAudioPlaybackCore(
  options: AudioPlaybackCoreOptions = {},
): AudioPlaybackCoreReturn {
  const { continueOnFailure = false, logPrefix = "Audio" } = options;

  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [currentLoadingId, setCurrentLoadingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isLoadingPlayAll, setIsLoadingPlayAll] = useState(false);
  const [playAllAbortController, setPlayAllAbortController] =
    useState<AbortController | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  // Refs to avoid stale closures in handlePlayAll
  const isPlayingAllRef = useRef(isPlayingAll);
  isPlayingAllRef.current = isPlayingAll;
  const isLoadingPlayAllRef = useRef(isLoadingPlayAll);
  isLoadingPlayAllRef.current = isLoadingPlayAll;
  const abortControllerRef = useRef(playAllAbortController);
  abortControllerRef.current = playAllAbortController;
  const currentAudioRef = useRef(currentAudio);
  currentAudioRef.current = currentAudio;

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
          revokeAndLog(audioUrl, logPrefix, `synthesized ended ${id}`);
        };

        audio.onerror = (): void => {
          setCurrentPlayingId(null);
          setCurrentLoadingId(null);
          revokeAndLog(audioUrl, logPrefix, `synthesized error ${id}`);
        };

        await audio.play();
      } catch (error) {
        logger.warn(`${logPrefix} playback failed:`, error);
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
      }
    },
    [logPrefix],
  );

  const handlePlayEntry = useCallback(
    (id: string, entries: TaskEntry[]) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) {return;}

      if (hasAudioSource(entry)) {
        setCurrentPlayingId(id);
        const playResult = getEntryPlayUrl(entry);
        if (playResult) {
          const playUrl = playResult.url;
          const audio = new Audio(playUrl);
          audio.onended = (): void => {
            setCurrentPlayingId(null);
            if (playResult.shouldRevoke) {
              revokeAndLog(playUrl, logPrefix, `cached ended ${id}`);
            }
          };
          audio.onerror = (): void => {
            if (playResult.shouldRevoke) {
              revokeAndLog(playUrl, logPrefix, `cached error ${id}`);
            }
            void synthesizeAndPlay(entry.stressedText, entry.text, id);
          };
          audio.play().catch(() => {
            if (playResult.shouldRevoke) {
              revokeAndLog(playUrl, logPrefix, `cached play-failure ${id}`);
            }
            void synthesizeAndPlay(entry.stressedText, entry.text, id);
          });
        }
      } else {
        void synthesizeAndPlay(entry.stressedText, entry.text, id);
      }
    },
    [synthesizeAndPlay],
  );

  const playSingleEntry = useCallback(
    async (entry: TaskEntry, abortSignal: AbortSignal): Promise<boolean> => {
      if (abortSignal.aborted) {return false;}

      let audioUrl: string | null = null;
      let shouldRevokeUrl = false;

      try {
        const cachedAudio = getEntryPlayUrl(entry);
        if (cachedAudio) {
          audioUrl = cachedAudio.url;
          shouldRevokeUrl = cachedAudio.shouldRevoke;
        } else {
          setCurrentLoadingId(entry.id);
          /* eslint-disable max-depth -- synthesis polling requires try inside cache-miss branch */
          try {
            audioUrl = await synthesizeWithPolling(
              entry.stressedText,
              getVoiceModel(entry.text),
            );
            if (abortSignal.aborted) {
              setCurrentLoadingId(null);
              return false;
            }
          } catch (error) {
            logger.warn("Synthesis polling failed:", error);
            setCurrentLoadingId(null);
            return false;
          }
          /* eslint-enable max-depth -- end nested synthesis block */
        }

        if (!audioUrl || abortSignal.aborted) {return false;}

        const finalAudioUrl = audioUrl;
        return new Promise((resolve) => {
          const audio = new Audio(finalAudioUrl);
          setCurrentAudio(audio);

          const cleanup = (reason: string): void => {
            setCurrentPlayingId(null);
            setCurrentLoadingId(null);
            setCurrentAudio(null);
            if (shouldRevokeUrl && audioUrl) {
              revokeAndLog(audioUrl, logPrefix, `${reason} ${entry.id}`);
            }
          };

          audio.onloadeddata = (): void => {
            setCurrentLoadingId(null);
            setCurrentPlayingId(entry.id);
          };

          audio.onended = (): void => {
            cleanup("ended");
            resolve(true);
          };
          audio.onerror = (): void => {
            cleanup("error");
            resolve(false);
          };

          abortSignal.addEventListener("abort", () => {
            audio.pause();
            audio.src = "";
            cleanup("abort");
            resolve(false);
          });

          audio.play().catch(() => {
            cleanup("play-failure");
            resolve(false);
          });
        });
      } catch (error) {
        logger.warn(`${logPrefix} playback error:`, error);
        setCurrentLoadingId(null);
        setCurrentPlayingId(null);
        if (shouldRevokeUrl && audioUrl) {
          revokeAndLog(audioUrl, logPrefix, "catch");
        }
        return false;
      }
    },
    [logPrefix],
  );

  const handlePlayAll = useCallback(
    async (entries: TaskEntry[]) => { // eslint-disable-line max-statements -- playback orchestration has many state transitions
      if (isPlayingAllRef.current || isLoadingPlayAllRef.current) {
        abortControllerRef.current?.abort();
        setPlayAllAbortController(null);
        setIsPlayingAll(false);
        setIsLoadingPlayAll(false);
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.src = "";
          setCurrentAudio(null);
          logger.debug(`${logPrefix} cleanup: stopped current audio on playAll toggle`);
        }
        setCurrentPlayingId(null);
        setCurrentLoadingId(null);
        return;
      }

      if (entries.length === 0) {return;}

      const abortController = new AbortController();
      setPlayAllAbortController(abortController);
      setIsLoadingPlayAll(true);

      let isFirstEntry = true;
      for (const entry of entries) {
        if (abortController.signal.aborted) {break;}

        const success = await playSingleEntry(entry, abortController.signal); // eslint-disable-line no-await-in-loop -- sequential playback is intentional

        if (isFirstEntry && success) {
          setIsLoadingPlayAll(false);
          setIsPlayingAll(true);
          isFirstEntry = false;
        }

        if (abortController.signal.aborted) {break;}
        if (!continueOnFailure && !success) {break;}
      }

      setIsPlayingAll(false);
      setIsLoadingPlayAll(false);
      setPlayAllAbortController(null);
      setCurrentPlayingId(null);
      setCurrentLoadingId(null);
    },
    [playSingleEntry, continueOnFailure],
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
