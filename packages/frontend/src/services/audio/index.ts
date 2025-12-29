export * from './types';
export { analyzeText, toPhoneticText, getWordVariants } from './vabamorf';
export { synthesize, synthesizeToBlob } from './merlin';
export { getCachedAudio, cacheAudio, generateCacheKey } from './cache';
export { synthesizeText, synthesizeWithRetry } from './synthesis';
export { synthesizeViaApi } from './audio-api';

export async function playAudio(url: string): Promise<void> {
  const audio = new Audio(url);
  await audio.play();
}
