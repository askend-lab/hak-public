import { calculateHash } from '@hak/shared';

import { API_CONFIG } from '../config';
import { httpGet, httpPost, HttpError } from '../http';

import type { AudioCacheEntry } from './types';
import type { VoiceModel } from '../../core/schemas';

const HTTP_NOT_FOUND = 404;
const DEFAULT_TTL_DAYS = 365;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function getCachedAudio(hash: string): Promise<AudioCacheEntry | null> {
  try {
    return await httpGet<AudioCacheEntry>(`${API_CONFIG.cacheUrl}/${hash}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === HTTP_NOT_FOUND) return null;
    console.error('Cache lookup failed:', error);
    return null;
  }
}

export async function cacheAudio(
  hash: string,
  audioUrl: string,
  ttlDays = DEFAULT_TTL_DAYS
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * MS_PER_DAY);

  await httpPost(API_CONFIG.cacheUrl, {
    hash,
    audioUrl,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

export async function generateCacheKey(
  text: string,
  voiceModel: VoiceModel,
  version = 'v1'
): Promise<string> {
  const hash = await calculateHash(text);
  return `${version}:${voiceModel}:${hash}`;
}

