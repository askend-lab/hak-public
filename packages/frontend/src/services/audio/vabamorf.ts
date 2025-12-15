import type { VabamorfResponse } from './types';
import { httpPost } from '../http';
import { API_CONFIG } from '../config';

export async function analyzeText(text: string): Promise<VabamorfResponse> {
  return httpPost<VabamorfResponse>(API_CONFIG.vabamorfUrl, { text });
}

export function toPhoneticText(response: VabamorfResponse): string {
  return response.words.map((word) => word.phonetic).join(' ');
}

export function getWordVariants(
  response: VabamorfResponse,
  wordIndex: number
) {
  const word = response.words[wordIndex];
  if (!word) return [];
  return word.variants || [{ phonetic: word.phonetic, stress: word.stress }];
}
