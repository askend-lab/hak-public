// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { convertTextToTags, CACHE_INVALIDATION, getVoiceModel, type SentenceState } from "@/types/synthesis";
import { logger } from "@hak/shared";
import * as Sentry from "@sentry/react";
import { checkCachedAudio, computeCacheKey } from "@/features/synthesis/utils/synthesize";
import type { useSynthesisAPI } from "./useSynthesisAPI";
import type { useAudioPlayer } from "./useAudioPlayer";

// #region agent log
const _dbg = (loc: string, msg: string, data: Record<string, unknown>, hyp: string) => { const p = {sessionId:'48623f',location:loc,message:msg,data,timestamp:Date.now(),hypothesisId:hyp}; console.warn('[DBG]',msg,data); fetch('/debug-log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}).catch(()=>{}); };
// #endregion

const MAX_RETRY_COUNT = 1;
const RETRY_DELAY_MS = 100;

type AudioAPI = ReturnType<typeof useAudioPlayer>;

export interface OrchestratorDeps {
  readonly getSentence: (id: string) => SentenceState | undefined;
  readonly updateSentence: (id: string, u: Partial<SentenceState>) => void;
  readonly synthesisAPI: ReturnType<typeof useSynthesisAPI>;
  readonly playAudio: AudioAPI["playAudio"];
  readonly playWithAbort: AudioAPI["playWithAbort"];
  readonly stopCurrentAudio: AudioAPI["stopCurrentAudio"];
  readonly sentencesRef: { current: SentenceState[] };
}

interface RetryOpts {
  readonly id: string;
  readonly retryCount: number;
  readonly retryFn: () => void;
}

function retryOnError(deps: OrchestratorDeps, opts: RetryOpts): () => void {
  return () => {
    deps.updateSentence(opts.id, { isLoading: false, isPlaying: false, ...CACHE_INVALIDATION });
    if (opts.retryCount < MAX_RETRY_COUNT) { setTimeout(opts.retryFn, RETRY_DELAY_MS); }
  };
}

interface ResolveOpts {
  readonly sentence: SentenceState;
  readonly id: string;
  readonly abortSignal?: AbortSignal | undefined;
}

async function tryBackendCache(text: string): Promise<string | null> {
  if (!text.trim()) {return null;}
  try {
    const cacheKey = await computeCacheKey(text, getVoiceModel(text));
    const result = await checkCachedAudio(cacheKey);
    // #region agent log
    _dbg('orchestratorHelpers.ts:tryBackendCache','Backend cache lookup',{textUsedForKey:text,voice:getVoiceModel(text),cacheKey,hit:!!result},'A');
    // #endregion
    return result;
  } catch { return null; }
}

async function fetchAudioUrl(deps: OrchestratorDeps, sentence: SentenceState): Promise<string> {
  const cached = await tryBackendCache(sentence.text);
  if (cached) {return cached;}
  const r = await deps.synthesisAPI.synthesizeWithCache(sentence.text, sentence.phoneticText ?? undefined);
  return r.audioUrl;
}

async function resolveAudioUrl(deps: OrchestratorDeps, opts: ResolveOpts): Promise<string | null> {
  if (opts.sentence.audioUrl) {return opts.sentence.audioUrl;}
  if (opts.abortSignal?.aborted) {return null;}
  try { return await fetchAndStore(deps, opts); }
  catch (error) { logger.error("Failed to synthesize audio:", error); Sentry.captureException(error, { tags: { synthesis: "resolve" } }); return null; }
}

async function fetchAndStore(deps: OrchestratorDeps, opts: ResolveOpts): Promise<string | null> {
  const audioUrl = await fetchAudioUrl(deps, opts.sentence);
  if (opts.abortSignal?.aborted) {return null;}
  deps.updateSentence(opts.id, { audioUrl });
  return audioUrl;
}

interface PlaybackRetryOpts {
  readonly id: string;
  readonly retryCount: number;
  readonly cachedUrl: string | null | undefined;
  readonly replayFn: () => void;
}

function makePlaybackRetry(deps: OrchestratorDeps, opts: PlaybackRetryOpts): () => void {
  return () => {
    deps.updateSentence(opts.id, { isPlaying: false });
    if (opts.retryCount === 0 && opts.cachedUrl) {
      deps.updateSentence(opts.id, CACHE_INVALIDATION);
      setTimeout(opts.replayFn, RETRY_DELAY_MS);
    }
  };
}

interface PlaySingleOpts {
  readonly id: string;
  readonly abortSignal?: AbortSignal | undefined;
  readonly retryCount?: number | undefined;
}

function playCallbacks(deps: OrchestratorDeps, id: string, onError: () => void): { onEnded: () => void; onError: () => void } {
  return { onEnded: () => deps.updateSentence(id, { isPlaying: false }), onError };
}

function buildSingleRetry(deps: OrchestratorDeps, opts: PlaySingleOpts): () => void {
  const { id, abortSignal } = opts;
  const sentence = deps.getSentence(id);
  return makePlaybackRetry(deps, { id, retryCount: opts.retryCount ?? 0, cachedUrl: sentence?.audioUrl, replayFn: () => { void doPlaySingle(deps, { id, abortSignal, retryCount: 1 }); } });
}

async function resolveAndPlay(deps: OrchestratorDeps, opts: PlaySingleOpts, sentence: SentenceState): Promise<boolean> {
  const { id, abortSignal, retryCount = 0 } = opts;
  const audioUrl = await resolveAudioUrl(deps, { sentence, id, abortSignal });
  if (!audioUrl || abortSignal?.aborted) {return false;}
  const cbs = playCallbacks(deps, id, buildSingleRetry(deps, { id, abortSignal, retryCount }));
  if (abortSignal) {return deps.playWithAbort(audioUrl, abortSignal, { onStart: () => deps.updateSentence(id, { isPlaying: true }), ...cbs });}
  return deps.playAudio(audioUrl, { onLoadStart: () => deps.updateSentence(id, { isPlaying: true }), ...cbs });
}

export async function doPlaySingle(deps: OrchestratorDeps, opts: PlaySingleOpts): Promise<boolean> {
  const sentence = deps.getSentence(opts.id);
  if (!sentence?.text.trim()) {return false;}
  return resolveAndPlay(deps, opts, sentence);
}

interface CacheOpts {
  readonly id: string;
  readonly audioUrl: string;
  readonly retryCount: number;
  readonly retrySelf: () => void;
}

async function tryCachedPlayback(deps: OrchestratorDeps, opts: CacheOpts): Promise<boolean> {
  try {
    await deps.playAudio(opts.audioUrl, {
      onLoadComplete: () => deps.updateSentence(opts.id, { isLoading: false, isPlaying: true }),
      onEnded: () => deps.updateSentence(opts.id, { isPlaying: false }),
      onError: retryOnError(deps, { id: opts.id, retryCount: opts.retryCount, retryFn: opts.retrySelf }),
    });
    return true;
  } catch (error) {
    logger.warn("Cache playback failed, re-synthesizing:", error);
    deps.updateSentence(opts.id, CACHE_INVALIDATION);
    return false;
  }
}

function buildSynthUpdates(tags: string[], result: { audioUrl: string; phoneticText: string; stressedTags?: string[] | undefined }): Partial<SentenceState> {
  const u: Partial<SentenceState> = { isLoading: false, isPlaying: true, phoneticText: result.phoneticText, audioUrl: result.audioUrl };
  if (result.stressedTags?.length === tags.length) { u.stressedTags = result.stressedTags; }
  return u;
}

interface FreshSynthOpts {
  readonly id: string;
  readonly text: string;
  readonly phoneticHint?: string | undefined;
}

async function freshSynthesize(deps: OrchestratorDeps, opts: FreshSynthOpts): Promise<void> {
  // #region agent log
  _dbg('orchestratorHelpers.ts:freshSynthesize','Synthesizing from scratch',{id:opts.id,text:opts.text,phoneticHint:opts.phoneticHint},'C');
  // #endregion
  const result = await deps.synthesisAPI.synthesizeText(opts.text, opts.phoneticHint);
  const tags = convertTextToTags(opts.text);
  await deps.playAudio(result.audioUrl, {
    onLoadComplete: () => deps.updateSentence(opts.id, buildSynthUpdates(tags, result)),
    onEnded: () => deps.updateSentence(opts.id, { isPlaying: false }),
    onError: () => deps.updateSentence(opts.id, { isLoading: false, isPlaying: false }),
  });
}

interface CacheAttemptOpts {
  readonly id: string;
  readonly sentence: SentenceState;
  readonly retryCount: number;
}

async function tryPlayFromCache(deps: OrchestratorDeps, opts: CacheAttemptOpts): Promise<boolean> {
  const { id, sentence, retryCount } = opts;
  if (!sentence.audioUrl || !sentence.phoneticText) {return false;}
  deps.updateSentence(id, { tags: convertTextToTags(sentence.text), isPlaying: false });
  return tryCachedPlayback(deps, { id, audioUrl: sentence.audioUrl, retryCount, retrySelf: () => { void doSynthesizeAndPlay(deps, id, retryCount + 1); } });
}

async function synthesizeFromScratch(deps: OrchestratorDeps, sentence: SentenceState): Promise<void> {
  const { id, text, phoneticText } = sentence;
  deps.updateSentence(id, { tags: convertTextToTags(text), isLoading: true, isPlaying: false });
  try { await freshSynthesize(deps, { id, text, phoneticHint: phoneticText || undefined }); }
  catch (error) { logger.error("Failed to synthesize:", error); Sentry.captureException(error, { tags: { synthesis: "fresh" } }); deps.updateSentence(id, { isLoading: false, isPlaying: false }); }
}

interface BackendCacheOpts { readonly id: string; readonly text: string; readonly lookupText?: string | undefined; readonly retryCount: number; readonly retrySelf: () => void }

async function tryPlayFromBackendCache(deps: OrchestratorDeps, opts: BackendCacheOpts): Promise<boolean> {
  const cachedUrl = await tryBackendCache(opts.lookupText || opts.text);
  if (!cachedUrl) {return false;}
  // #region agent log
  const sentBefore = deps.getSentence(opts.id);
  _dbg('orchestratorHelpers.ts:tryPlayFromBackendCache','Backend cache HIT',{id:opts.id,text:opts.text,cachedUrl,phoneticTextBefore:sentBefore?.phoneticText,stressedTagsBefore:sentBefore?.stressedTags},'B');
  // #endregion
  const sentence = deps.getSentence(opts.id);
  const phoneticText = sentence?.phoneticText || opts.text;
  const stressedTags = sentence?.stressedTags || convertTextToTags(phoneticText);
  deps.updateSentence(opts.id, { tags: convertTextToTags(opts.text), audioUrl: cachedUrl, phoneticText, stressedTags });
  if (!sentence?.phoneticText) {
    const plainText = opts.text;
    void deps.synthesisAPI.analyzeText(plainText).then(({ stressedText }) => {
      if (stressedText) {
        const tags = convertTextToTags(stressedText);
        const sent = deps.getSentence(opts.id);
        if (sent && sent.phoneticText === plainText) { deps.updateSentence(opts.id, { phoneticText: stressedText, stressedTags: tags.length === sent.tags.length ? tags : undefined }); }
      }
    }).catch(() => {});
  }
  await tryCachedPlayback(deps, { id: opts.id, audioUrl: cachedUrl, retryCount: opts.retryCount, retrySelf: opts.retrySelf });
  return true;
}

export async function doSynthesizeAndPlay(deps: OrchestratorDeps, id: string, retryCount = 0): Promise<void> {
  const sentence = deps.sentencesRef.current.find((s) => s.id === id);
  if (!sentence?.text.trim()) {return;}
  // #region agent log
  _dbg('orchestratorHelpers.ts:doSynthesizeAndPlay','Entry',{id,text:sentence.text,phoneticText:sentence.phoneticText,audioUrl:sentence.audioUrl?'exists':null,stressedTags:sentence.stressedTags,tags:sentence.tags,retryCount},'C,D');
  // #endregion
  deps.stopCurrentAudio();
  if (await tryPlayFromCache(deps, { id, sentence, retryCount })) {return;}
  if (await tryPlayFromBackendCache(deps, { id, text: sentence.text, lookupText: sentence.phoneticText || undefined, retryCount, retrySelf: () => { void doSynthesizeAndPlay(deps, id, retryCount + 1); } })) {return;}
  await synthesizeFromScratch(deps, sentence);
}

interface SynthTextOpts {
  readonly id: string;
  readonly text: string;
  readonly retryCount?: number | undefined;
}

function hasCachedAudio(s: SentenceState | undefined, text: string): s is SentenceState & { audioUrl: string } {
  return Boolean(s?.audioUrl && s?.phoneticText && s.text === text);
}

async function tryCachedText(deps: OrchestratorDeps, opts: SynthTextOpts): Promise<boolean> {
  const { id, text, retryCount = 0 } = opts;
  const sentence = deps.getSentence(id);
  if (!hasCachedAudio(sentence, text)) {return false;}
  return tryCachedPlayback(deps, { id, audioUrl: sentence.audioUrl, retryCount, retrySelf: () => { void doSynthesizeWithText(deps, opts); } });
}

export async function doSynthesizeWithText(deps: OrchestratorDeps, opts: SynthTextOpts): Promise<void> {
  const { id, text, retryCount = 0 } = opts;
  // #region agent log
  const sentEntry = deps.getSentence(id);
  _dbg('orchestratorHelpers.ts:doSynthesizeWithText','Entry',{id,textArg:text,sentText:sentEntry?.text,phoneticText:sentEntry?.phoneticText,audioUrl:sentEntry?.audioUrl?'exists':null,stressedTags:sentEntry?.stressedTags},'C,E');
  // #endregion
  deps.stopCurrentAudio();
  if (await tryCachedText(deps, opts)) {return;}
  if (await tryPlayFromBackendCache(deps, { id, text, retryCount, retrySelf: () => { void doSynthesizeWithText(deps, opts); } })) {return;}
  const sentence = deps.getSentence(id);
  deps.updateSentence(id, { isLoading: true, isPlaying: false });
  try { await freshSynthesize(deps, { id, text, phoneticHint: sentence?.phoneticText || undefined }); }
  catch (error) { logger.error("Failed to synthesize:", error); Sentry.captureException(error, { tags: { synthesis: "withText" } }); deps.updateSentence(id, { isLoading: false, isPlaying: false }); }
}
