import { withRetry } from '../../core/retry';
import { selectVoiceModel, countWords } from '../../core/utils';

import { synthesizeViaApi } from './audio-api';

import type { SynthesisResult } from './types';

export async function synthesizeText(text: string): Promise<SynthesisResult> {
  const wordCount = countWords(text);
  const voiceModel = selectVoiceModel(wordCount);

  const audioUrl = await synthesizeViaApi(text);

  return {
    originalText: text,
    phoneticText: text,
    audioUrl,
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
