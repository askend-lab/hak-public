import type { SynthesisEntry, TaskEntry } from './schemas';

export function generateAudioHash(
  text: string,
  voiceModel: 'efm_s' | 'efm_l'
): string {
  const normalized = normalizeText(text);
  const input = `${normalized}:${voiceModel}`;
  return simpleHash(input);
}

export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s\-'`´+]/gu, '');
}

export function selectVoiceModel(wordCount: number): 'efm_s' | 'efm_l' {
  return wordCount <= 3 ? 'efm_s' : 'efm_l';
}

export function countWords(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

export function createTaskEntry(
  synthesis: SynthesisEntry,
  order: number
): TaskEntry {
  return {
    id: generateUUID(),
    synthesis,
    order,
    addedAt: new Date().toISOString(),
  };
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
