import { API_CONFIG } from '../config';
import { httpPost } from '../http';

import type { VabamorfResponse } from './types';

interface EkiVabamorfResponse {
  stressedText: string;
  originalText: string;
}

export async function analyzeText(text: string): Promise<VabamorfResponse> {
  const ekiResponse = await httpPost<EkiVabamorfResponse>(API_CONFIG.vabamorfUrl, { text });
  
  const words = ekiResponse.originalText.split(/\s+/);
  const phoneticWords = ekiResponse.stressedText.split(/\s+/);
  
  return {
    words: words.map((word, i) => ({
      text: word,
      phonetic: phoneticWords[i] ?? word,
      stress: 1,
    })),
  };
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
  return word.variants ?? [{ phonetic: word.phonetic, stress: word.stress }];
}
