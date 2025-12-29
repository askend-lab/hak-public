import type { VoiceModel } from '../../core/schemas';

/**
 * AudioConnector interface for audio synthesis operations.
 * Abstracts S3, Lambda, and cache internals from Gherkin tests.
 */
export interface AudioConnector {
  /**
   * Synthesize text to audio
   * @param text - Text to synthesize (can include phonetic markers)
   * @param voiceModel - Optional voice model selection
   * @returns WAV audio blob
   */
  synthesize(text: string, voiceModel?: VoiceModel): Promise<Blob>;
}

/**
 * Extended interface for mock connectors with call tracking
 */
export interface MockableAudioConnector extends AudioConnector {
  getCalls(): string[];
  reset(): void;
}
