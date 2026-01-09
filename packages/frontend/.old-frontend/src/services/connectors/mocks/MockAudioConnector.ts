import type { VoiceModel } from '../../../core/schemas';
import type { MockableAudioConnector } from '../AudioConnector';

interface MockAudioConnectorOptions {
  response?: Blob;
}

/**
 * Creates a mock AudioConnector for testing.
 * Returns test WAV blob and tracks calls for verification.
 */
export function createMockAudioConnector(
  options: MockAudioConnectorOptions = {}
): MockableAudioConnector {
  const calls: string[] = [];
  
  const defaultBlob = new Blob(['RIFF....WAVEfmt '], { type: 'audio/wav' });
  const responseBlob = options.response ?? defaultBlob;

  return {
    async synthesize(text: string, _voiceModel?: VoiceModel): Promise<Blob> {
      calls.push(text);
      return responseBlob;
    },

    getCalls(): string[] {
      return [...calls];
    },

    reset(): void {
      calls.length = 0;
    },
  };
}
