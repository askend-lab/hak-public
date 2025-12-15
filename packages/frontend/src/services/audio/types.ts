import type { VoiceModel } from '../../core/schemas';

export interface VabamorfResponse {
  words: VabamorfWord[];
}

export interface VabamorfWord {
  text: string;
  phonetic: string;
  stress: number;
  variants?: PhoneticVariant[];
}

export interface PhoneticVariant {
  phonetic: string;
  stress: number;
  description?: string;
}

export interface MerlinRequest {
  text: string;
  voice: VoiceModel;
}

export interface MerlinResponse {
  audioUrl: string;
  duration: number;
}

export interface AudioCacheEntry {
  hash: string;
  audioUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface SynthesisResult {
  originalText: string;
  phoneticText: string;
  audioUrl: string;
  audioHash: string;
  voiceModel: VoiceModel;
  cached: boolean;
}
