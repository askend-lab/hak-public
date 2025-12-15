import type { VabamorfResponse } from './types';
import { httpPost } from '../http';

const VABAMORF_API_URL = import.meta.env.VITE_VABAMORF_URL || '/api/analyze';

export async function analyzeText(text: string): Promise<VabamorfResponse> {
  return httpPost<VabamorfResponse>(VABAMORF_API_URL, { text });
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
