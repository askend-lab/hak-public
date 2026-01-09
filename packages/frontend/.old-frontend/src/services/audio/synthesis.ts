import { withRetry } from '../../core/retry';
import { selectVoiceModel, countWords } from '../../core/utils';

import { synthesize } from './merlin';

import type { SynthesisResult } from './types';

interface SynthesizeOptions {
  phoneticText?: string;
}

export async function synthesizeText(
  text: string,
  options: SynthesizeOptions = {}
): Promise<SynthesisResult> {
  const wordCount = countWords(text);
  const voiceModel = selectVoiceModel(wordCount);

  // Use phoneticText for synthesis if provided (variant pronunciation)
  const textToSynthesize = options.phoneticText ?? text;
  const result = await synthesize({ text: textToSynthesize, voice: voiceModel });

  return {
    originalText: text,
    phoneticText: options.phoneticText ?? text,
    audioUrl: result.audioUrl,
    audioHash: '',
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
