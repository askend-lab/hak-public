import type { AudioCacheEntry } from './types';
import type { VoiceModel } from '../../core/schemas';
import { simpleHash } from '../../core/utils';
import { httpGet, httpPost, HttpError } from '../http';
import { API_CONFIG } from '../config';

const HTTP_NOT_FOUND = 404;
const DEFAULT_TTL_DAYS = 365;
const HOURS_PER_DAY = 24;
const MS_PER_HOUR = 60 * 60 * 1000;

export async function getCachedAudio(hash: string): Promise<AudioCacheEntry | null> {
  try {
    return await httpGet<AudioCacheEntry>(`${API_CONFIG.cacheUrl}/${hash}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === HTTP_NOT_FOUND) return null;
    return null;
  }
}

export async function cacheAudio(
  hash: string,
  audioUrl: string,
  ttlDays = DEFAULT_TTL_DAYS
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * HOURS_PER_DAY * MS_PER_HOUR);

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

