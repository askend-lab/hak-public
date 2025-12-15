import type { VabamorfResponse } from './types';

const VABAMORF_API_URL = import.meta.env.VITE_VABAMORF_URL || '/api/analyze';

export async function analyzeText(text: string): Promise<VabamorfResponse> {
  const response = await fetch(VABAMORF_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`Vabamorf analysis failed: ${response.status}`);
  }

  return response.json();
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
