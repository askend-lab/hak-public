// Mock modules that use import.meta.env
jest.mock('./cache', () => ({
  generateCacheKey: (text: string, voice: string, version = 'v1') => 
    `${version}:${voice}:${btoa(text)}`,
  checkCache: jest.fn(),
  saveToCache: jest.fn(),
}));

jest.mock('./vabamorf', () => ({
  toPhoneticText: (response?: { words?: Array<{ phonetic: string }> }) => 
    response?.words?.map((w: { phonetic: string }) => w.phonetic).join(' ') || '',
  analyzeText: jest.fn(),
}));

import { generateCacheKey } from './cache';
import { toPhoneticText } from './vabamorf';
import type { VabamorfResponse } from './types';

describe('generateCacheKey', () => {
  it('generates consistent key for same input', () => {
    const key1 = generateCacheKey('tere', 'efm_s');
    const key2 = generateCacheKey('tere', 'efm_s');
    expect(key1).toBe(key2);
  });

  it('generates different key for different voice', () => {
    const key1 = generateCacheKey('tere', 'efm_s');
    const key2 = generateCacheKey('tere', 'efm_l');
    expect(key1).not.toBe(key2);
  });

  it('generates different key for different text', () => {
    const key1 = generateCacheKey('tere', 'efm_s');
    const key2 = generateCacheKey('head', 'efm_s');
    expect(key1).not.toBe(key2);
  });

  it('includes version prefix', () => {
    const key = generateCacheKey('tere', 'efm_s', 'v2');
    expect(key.startsWith('v2:')).toBe(true);
  });

  it('includes voice model', () => {
    const key = generateCacheKey('tere', 'efm_l');
    expect(key.includes(':efm_l:')).toBe(true);
  });
});

describe('toPhoneticText', () => {
  it('joins words with spaces', () => {
    const response: VabamorfResponse = {
      words: [
        { text: 'Tere', phonetic: "te`re", stress: 1 },
        { text: 'päevast', phonetic: "pä'evast", stress: 2 },
      ],
    };
    expect(toPhoneticText(response)).toBe("te`re pä'evast");
  });

  it('handles single word', () => {
    const response: VabamorfResponse = {
      words: [{ text: 'Tere', phonetic: "te`re", stress: 1 }],
    };
    expect(toPhoneticText(response)).toBe("te`re");
  });

  it('handles empty response', () => {
    const response: VabamorfResponse = { words: [] };
    expect(toPhoneticText(response)).toBe('');
  });
});
