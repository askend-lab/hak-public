import type { SynthesisEntry, TaskEntry, VoiceModel } from './schemas';

const HEX_BASE = 16;
const UUID_RANDOM_MASK = 0x3;
const UUID_VERSION_BITS = 0x8;
const HASH_PAD_LENGTH = 8;

export function generateAudioHash(
  text: string,
  voiceModel: VoiceModel
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

export function selectVoiceModel(wordCount: number): VoiceModel {
  return wordCount <= 3 ? 'efm_s' : 'efm_l';
}

export function countWords(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

export interface CreateSynthesisEntryInput {
  originalText: string;
  phoneticText: string;
  audioHash: string;
  voiceModel: VoiceModel;
}

export function createSynthesisEntry(input: CreateSynthesisEntryInput): SynthesisEntry {
  return {
    id: generateUUID(),
    originalText: input.originalText,
    phoneticText: input.phoneticText,
    audioHash: input.audioHash,
    voiceModel: input.voiceModel,
    createdAt: nowISO(),
  };
}

export function createTaskEntry(
  synthesis: SynthesisEntry,
  order: number
): TaskEntry {
  return {
    id: generateUUID(),
    synthesis,
    order,
    addedAt: nowISO(),
  };
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * HEX_BASE) | 0;
    const v = c === 'x' ? r : (r & UUID_RANDOM_MASK) | UUID_VERSION_BITS;
    return v.toString(HEX_BASE);
  });
}

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(HEX_BASE).padStart(HASH_PAD_LENGTH, '0');
}
