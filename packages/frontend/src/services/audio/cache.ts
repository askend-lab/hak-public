import type { AudioCacheEntry } from './types';
import type { VoiceModel } from '../../core/schemas';
import { simpleHash } from '../../core/utils';
import { httpGet, httpPost, HttpError } from '../http';
import { API_CONFIG } from '../config';

export async function getCachedAudio(hash: string): Promise<AudioCacheEntry | null> {
  try {
    return await httpGet<AudioCacheEntry>(`${API_CONFIG.cacheUrl}/${hash}`);
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

  await httpPost(API_CONFIG.cacheUrl, {
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

