import type { SynthesisResult } from './types';
import { analyzeText, toPhoneticText } from './vabamorf';
import { synthesize } from './merlin';
import { getCachedAudio, cacheAudio, generateCacheKey } from './cache';
import { selectVoiceModel, countWords } from '../../core/utils';

export async function synthesizeText(text: string): Promise<SynthesisResult> {
  const wordCount = countWords(text);
  const voiceModel = selectVoiceModel(wordCount);

  const vabamorfResponse = await analyzeText(text);
  const phoneticText = toPhoneticText(vabamorfResponse);

  const cacheKey = generateCacheKey(phoneticText, voiceModel);
  const cached = await getCachedAudio(cacheKey);

  if (cached) {
    return {
      originalText: text,
      phoneticText,
      audioUrl: cached.audioUrl,
      audioHash: cacheKey,
      voiceModel,
      cached: true,
    };
  }

  const merlinResponse = await synthesize({ text: phoneticText, voice: voiceModel });

  await cacheAudio(cacheKey, merlinResponse.audioUrl).catch(() => {
    // Cache write failure is non-critical
  });

  return {
    originalText: text,
    phoneticText,
    audioUrl: merlinResponse.audioUrl,
    audioHash: cacheKey,
    voiceModel,
    cached: false,
  };
}

export async function synthesizeWithRetry(
  text: string,
  maxRetries = 3
): Promise<SynthesisResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await synthesizeText(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries - 1) {
        await delay(1000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Synthesis failed');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
