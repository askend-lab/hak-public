import type { SynthesisResult } from './types';
import { analyzeText, toPhoneticText } from './vabamorf';
import { synthesize } from './merlin';
import { getCachedAudio, cacheAudio, generateCacheKey } from './cache';
import { selectVoiceModel, countWords } from '../../core/utils';
import { withRetry } from '../../core/retry';

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
  return withRetry(() => synthesizeText(text), { maxRetries });
}
