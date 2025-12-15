import type { AudioCacheEntry } from './types';
import type { VoiceModel } from '../../core/schemas';
import { simpleHash } from '../../core/utils';

const CACHE_API_URL = import.meta.env.VITE_CACHE_URL || '/api/audio-cache';

export async function getCachedAudio(hash: string): Promise<AudioCacheEntry | null> {
  try {
    const response = await fetch(`${CACHE_API_URL}/${hash}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Cache lookup failed: ${response.status}`);
    return response.json();
  } catch {
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

  await fetch(CACHE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hash,
      audioUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }),
  });
}

export function generateCacheKey(
  text: string,
  voiceModel: VoiceModel,
  version = 'v1'
): string {
  return `${version}:${voiceModel}:${simpleHash(text)}`;
}

