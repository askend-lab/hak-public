// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { logger } from "@hak/shared";
import { TaskEntry, getEntryPlayUrl } from "@/types/task";
import { synthesizeWithPolling, computeCacheKey, checkCachedAudio } from "@/features/synthesis/utils/synthesize";
import { getVoiceModel } from "@/types/synthesis";
import type { AudioAction } from "./useAudioPlaybackState";

type Dispatch = React.Dispatch<AudioAction>;

function revokeAndLog(url: string, prefix: string, reason: string): void {
  URL.revokeObjectURL(url);
  logger.debug(`${prefix} cleanup: revoked URL (${reason})`);
}

interface PlayResult {
  url: string;
  shouldRevoke: boolean;
}

interface SynthesizeInput {
  entry: TaskEntry;
  id: string;
  playResult: PlayResult | null;
  logPrefix: string;
  dispatch: Dispatch;
}

function attachSynthHandlers(audio: HTMLAudioElement, opts: { audioUrl: string; id: string; logPrefix: string; dispatch: Dispatch }): void {
  Object.assign(audio, {
    onloadeddata: (): void => { opts.dispatch({ type: "SET_PLAYING", id: opts.id }); opts.dispatch({ type: "CLEAR_LOADING" }); },
    onended: (): void => { opts.dispatch({ type: "CLEAR_BOTH" }); revokeAndLog(opts.audioUrl, opts.logPrefix, `synth ended ${opts.id}`); },
    onerror: (): void => { opts.dispatch({ type: "CLEAR_BOTH" }); revokeAndLog(opts.audioUrl, opts.logPrefix, `synth error ${opts.id}`); },
  });
}

async function tryBackendCache(text: string): Promise<string | null> {
  if (!text.trim()) {return null;}
  try {
    const cacheKey = await computeCacheKey(text, getVoiceModel(text));
    return await checkCachedAudio(cacheKey);
  } catch { return null; }
}

async function doSynthesize(input: SynthesizeInput): Promise<void> {
  const { entry, id, logPrefix, dispatch } = input;
  dispatch({ type: "SET_LOADING", id });
  try {
    const cached = await tryBackendCache(entry.stressedText);
    const audioUrl = cached ?? (await synthesizeWithPolling(entry.stressedText, getVoiceModel(entry.text))).audioUrl;
    const audio = new Audio(audioUrl);
    attachSynthHandlers(audio, { audioUrl, id, logPrefix, dispatch });
    await audio.play();
  } catch (error) {
    logger.warn(`${logPrefix} playback failed:`, error);
    dispatch({ type: "CLEAR_BOTH" });
  }
}

function playCached(input: SynthesizeInput, playResult: PlayResult): void {
  const { id, logPrefix, dispatch } = input;
  const { url: playUrl, shouldRevoke } = playResult;
  const audio = new Audio(playUrl);
  const maybeRevoke = (reason: string): void => { if (shouldRevoke) {revokeAndLog(playUrl, logPrefix, `${reason} ${id}`);} };
  audio.onended = (): void => { dispatch({ type: "CLEAR_PLAYING" }); maybeRevoke("cached ended"); };
  audio.onerror = (): void => { maybeRevoke("cached error"); void doSynthesize(input); };
  audio.play().catch(() => { maybeRevoke("cached play-failure"); void doSynthesize(input); });
}

export function synthesizeAndCreateAudio(input: SynthesizeInput): void {
  if (input.playResult) {
    playCached(input, input.playResult);
  } else {
    void doSynthesize(input);
  }
}

function clearLoading(dispatch: Dispatch): null { dispatch({ type: "CLEAR_LOADING" }); return null; }

async function fetchAudioUrl(entry: TaskEntry, abortSignal: AbortSignal, dispatch: Dispatch): Promise<string | null> {
  dispatch({ type: "SET_LOADING", id: entry.id });
  try {
    const cached = await tryBackendCache(entry.stressedText);
    if (cached) {return cached;}
    if (abortSignal.aborted) {return clearLoading(dispatch);}
    const result = await synthesizeWithPolling(entry.stressedText, getVoiceModel(entry.text));
    if (abortSignal.aborted) {return clearLoading(dispatch);}
    return result.audioUrl;
  } catch (error) {
    logger.warn("Synthesis polling failed:", error);
    return clearLoading(dispatch);
  }
}

export async function resolveEntryAudioUrl(
  entry: TaskEntry,
  abortSignal: AbortSignal,
  dispatch: Dispatch,
): Promise<PlayResult | null> {
  const cached = getEntryPlayUrl(entry);
  if (cached) {return cached;}
  const url = await fetchAudioUrl(entry, abortSignal, dispatch);
  return url ? { url, shouldRevoke: false } : null;
}

interface PlayAudioInput {
  url: string;
  shouldRevoke: boolean;
  entryId: string;
  abortSignal: AbortSignal;
  logPrefix: string;
  dispatch: Dispatch;
}

export function playAudioWithPromise(input: PlayAudioInput): Promise<boolean> {
  const { url, shouldRevoke, entryId, abortSignal, logPrefix, dispatch } = input;
  return new Promise((resolve) => {
    const audio = new Audio(url);
    dispatch({ type: "SET_AUDIO", audio });
    const cleanup = (reason: string): void => {
      dispatch({ type: "CLEAR_AUDIO" });
      if (shouldRevoke) {revokeAndLog(url, logPrefix, `${reason} ${entryId}`);}
    };
    audio.onloadeddata = (): void => { dispatch({ type: "CLEAR_LOADING" }); dispatch({ type: "SET_PLAYING", id: entryId }); };
    audio.onended = (): void => { cleanup("ended"); resolve(true); };
    audio.onerror = (): void => { cleanup("error"); resolve(false); };
    abortSignal.addEventListener("abort", () => { audio.pause(); audio.src = ""; cleanup("abort"); resolve(false); });
    audio.play().catch(() => { cleanup("play-failure"); resolve(false); });
  });
}
