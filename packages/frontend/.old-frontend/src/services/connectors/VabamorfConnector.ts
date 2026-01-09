import type { PhoneticVariant } from '../audio/types';

export interface VabamorfAnalysisResult {
  phoneticText: string;
  words: Array<{
    text: string;
    phonetic: string;
    stress: number;
  }>;
}

/**
 * VabamorfConnector interface for phonetic analysis operations.
 * Abstracts Vabamorf API internals from Gherkin tests.
 */
export interface VabamorfConnector {
  /**
   * Analyze text and return phonetic representation
   */
  analyze(text: string): Promise<VabamorfAnalysisResult>;

  /**
   * Get pronunciation variants for a specific word
   */
  getVariants(word: string): Promise<PhoneticVariant[]>;
}

/**
 * Extended interface for mock connectors with call tracking
 */
export interface MockableVabamorfConnector extends VabamorfConnector {
  getAnalyzeCalls(): string[];
  getVariantCalls(): string[];
  reset(): void;
}
