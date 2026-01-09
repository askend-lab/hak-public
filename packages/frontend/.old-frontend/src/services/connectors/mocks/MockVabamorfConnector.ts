import type { PhoneticVariant } from '../../../services/audio/types';
import type { MockableVabamorfConnector, VabamorfAnalysisResult } from '../VabamorfConnector';

interface MockVabamorfConnectorOptions {
  phoneticResponses?: Record<string, string>;
  variantResponses?: Record<string, PhoneticVariant[]>;
}

/**
 * Creates a mock VabamorfConnector for testing.
 * Returns configured phonetic text and tracks calls for verification.
 */
export function createMockVabamorfConnector(
  options: MockVabamorfConnectorOptions = {}
): MockableVabamorfConnector {
  const analyzeCalls: string[] = [];
  const variantCalls: string[] = [];

  const defaultPhonetic = (text: string): string => text;
  const defaultVariants: PhoneticVariant[] = [{ phonetic: 'default', stress: 1 }];

  return {
    async analyze(text: string): Promise<VabamorfAnalysisResult> {
      analyzeCalls.push(text);
      const phoneticText = options.phoneticResponses?.[text] ?? defaultPhonetic(text);
      const words = text.split(/\s+/).map(word => ({
        text: word,
        phonetic: options.phoneticResponses?.[word] ?? word,
        stress: 1,
      }));
      return { phoneticText, words };
    },

    async getVariants(word: string): Promise<PhoneticVariant[]> {
      variantCalls.push(word);
      return options.variantResponses?.[word] ?? defaultVariants;
    },

    getAnalyzeCalls(): string[] {
      return [...analyzeCalls];
    },

    getVariantCalls(): string[] {
      return [...variantCalls];
    },

    reset(): void {
      analyzeCalls.length = 0;
      variantCalls.length = 0;
    },
  };
}
