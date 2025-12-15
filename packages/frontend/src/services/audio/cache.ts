import type { AudioCacheEntry } from './types';
import type { VoiceModel } from '../../core/schemas';
import { simpleHash } from '../../core/utils';
import { httpGet, httpPost, HttpError } from '../http';

const CACHE_API_URL = import.meta.env.VITE_CACHE_URL || '/api/audio-cache';

export async function getCachedAudio(hash: string): Promise<AudioCacheEntry | null> {
  try {
    return await httpGet<AudioCacheEntry>(`${CACHE_API_URL}/${hash}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    return null;
  }
}

export async function cacheAudio(
  hash: string,
  audioUrl: string,
  ttlDays = 365
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

  await httpPost(CACHE_API_URL, {
    hash,
    audioUrl,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

export function generateCacheKey(
  text: string,
  voiceModel: VoiceModel,
  version = 'v1'
): string {
  return `${version}:${voiceModel}:${simpleHash(text)}`;
}

