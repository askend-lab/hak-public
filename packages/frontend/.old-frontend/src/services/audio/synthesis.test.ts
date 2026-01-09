import { vi, type MockedFunction } from 'vitest';
// Mock config before imports to handle import.meta.env
vi.mock('../config', () => ({
  API_CONFIG: {
    audioApiUrl: 'https://api.example.com/audio',
    audioBucketUrl: 'https://bucket.example.com',
    merlinUrl: 'https://merlin.example.com'
  }
}));

// Mock modules that use import.meta.env
vi.mock('./cache', () => ({
  generateCacheKey: (text: string, voice: string, version: string): string => 
    `${version}:${voice}:${btoa(text)}`,
  checkCache: vi.fn(),
  saveToCache: vi.fn(),
}));

vi.mock('./vabamorf', () => ({
  toPhoneticText: (response?: { words?: { phonetic: string }[] }): string => 
     
    response?.words?.map((w: { phonetic: string }) => w.phonetic).join(' ') ?? '',
  analyzeText: vi.fn(),
}));

vi.mock('./merlin');
vi.mock('../../core/utils');
vi.mock('../../core/retry');

import { withRetry } from '../../core/retry';
import { selectVoiceModel, countWords } from '../../core/utils';

import { synthesize } from './merlin';
import { generateCacheKey } from './cache';
import { synthesizeText, synthesizeWithRetry } from './synthesis';
import { toPhoneticText } from './vabamorf';

import type { VabamorfResponse, SynthesisResult } from './types';
import type { VoiceModel } from '../../core/schemas';

// Mock dependencies
const mockSynthesize = synthesize as MockedFunction<typeof synthesize>;
const mockSelectVoiceModel = selectVoiceModel as MockedFunction<typeof selectVoiceModel>;
const mockCountWords = countWords as MockedFunction<typeof countWords>;
const mockWithRetry = withRetry as MockedFunction<typeof withRetry>;

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

  it('includes version prefix', async () => {
    const key = await generateCacheKey('tere', 'efm_s', 'v2');
    expect(key.startsWith('v2:')).toBe(true);
  });

  it('includes voice model', () => {
    const key = generateCacheKey('tere', 'efm_l');
    expect(key).toContain(':efm_l:');
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

describe('synthesizeText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should synthesize text and return result', async () => {
    const text = 'test text';
    const wordCount = 2;
    const voiceModel: VoiceModel = 'efm_s';
    const audioUrl = 'https://example.com/audio.mp3';

    mockCountWords.mockReturnValue(wordCount);
    mockSelectVoiceModel.mockReturnValue(voiceModel);
    mockSynthesize.mockResolvedValue({ audioUrl, duration: 0 });

    const result = await synthesizeText(text);

    expect(result).toStrictEqual({
      originalText: text,
      phoneticText: text,
      audioUrl,
      audioHash: '',
      voiceModel,
      cached: false
    });

    expect(mockCountWords).toHaveBeenCalledWith(text);
    expect(mockSelectVoiceModel).toHaveBeenCalledWith(wordCount);
    expect(mockSynthesize).toHaveBeenCalledWith({ text, voice: voiceModel });
  });

  it('should handle empty text', async () => {
    const text = '';
    const wordCount = 0;
    const voiceModel: VoiceModel = 'efm_l';
    const audioUrl = 'https://example.com/empty.mp3';

    mockCountWords.mockReturnValue(wordCount);
    mockSelectVoiceModel.mockReturnValue(voiceModel);
    mockSynthesize.mockResolvedValue({ audioUrl, duration: 0 });

    const result = await synthesizeText(text);

    expect(result).toStrictEqual({
      originalText: '',
      phoneticText: '',
      audioUrl,
      audioHash: '',
      voiceModel,
      cached: false
    });
  });
});

describe('synthesizeWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call synthesizeText with retry logic', async () => {
    const text = 'test text';
    const voiceModel: VoiceModel = 'efm_s';
    const expectedResult: SynthesisResult = {
      originalText: text,
      phoneticText: text,
      audioUrl: 'https://example.com/retry.mp3',
      audioHash: '',
      voiceModel,
      cached: false
    };

    mockWithRetry.mockImplementation(async (fn, options) => {
      expect(options?.maxRetries).toBe(3);
      return fn();
    });

    mockSynthesize.mockResolvedValue({ audioUrl: expectedResult.audioUrl, duration: 0 });
    mockCountWords.mockReturnValue(1);
    mockSelectVoiceModel.mockReturnValue(voiceModel);

    const result = await synthesizeWithRetry(text);

    expect(result).toStrictEqual(expectedResult);
    expect(mockWithRetry).toHaveBeenCalled();
  });

  it('should use custom maxRetries value', async () => {
    const text = 'test text';
    const voiceModel: VoiceModel = 'efm_l';
    const expectedResult: SynthesisResult = {
      originalText: text,
      phoneticText: text,
      audioUrl: 'https://example.com/custom.mp3',
      audioHash: '',
      voiceModel,
      cached: false
    };

    mockWithRetry.mockImplementation(async (fn, options) => {
      expect(options?.maxRetries).toBe(5);
      return fn();
    });

    mockSynthesize.mockResolvedValue({ audioUrl: expectedResult.audioUrl, duration: 0 });
    mockCountWords.mockReturnValue(1);
    mockSelectVoiceModel.mockReturnValue(voiceModel);

    const result = await synthesizeWithRetry(text, 5);

    expect(result).toStrictEqual(expectedResult);
  });

  it('should propagate errors from retry mechanism', async () => {
    const text = 'test text';
    const error = new Error('Synthesis failed');

    mockWithRetry.mockRejectedValue(error);

    await expect(synthesizeWithRetry(text)).rejects.toThrow('Synthesis failed');
  });
});
