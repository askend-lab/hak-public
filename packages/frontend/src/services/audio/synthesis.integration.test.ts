import { synthesizeText, synthesizeWithRetry } from './synthesis';
import { analyzeText, toPhoneticText } from './vabamorf';
import { synthesize } from './merlin';
import { getCachedAudio, cacheAudio, generateCacheKey } from './cache';
import { withRetry } from '../../core/retry';

jest.mock('./vabamorf');
jest.mock('./merlin');
jest.mock('./cache');
jest.mock('../../core/retry');

const mockAnalyzeText = analyzeText as jest.MockedFunction<typeof analyzeText>;
const mockToPhoneticText = toPhoneticText as jest.MockedFunction<typeof toPhoneticText>;
const mockSynthesize = synthesize as jest.MockedFunction<typeof synthesize>;
const mockGetCachedAudio = getCachedAudio as jest.MockedFunction<typeof getCachedAudio>;
const mockCacheAudio = cacheAudio as jest.MockedFunction<typeof cacheAudio>;
const mockGenerateCacheKey = generateCacheKey as jest.MockedFunction<typeof generateCacheKey>;
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;

describe('synthesizeText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAnalyzeText.mockResolvedValue({ words: [{ text: 'tere', phonetic: 'te`re', stress: 1 }] });
    mockToPhoneticText.mockReturnValue('te`re');
    mockGenerateCacheKey.mockReturnValue('v1:mari:abc123');
    mockGetCachedAudio.mockResolvedValue(null);
    mockSynthesize.mockResolvedValue({ audioUrl: 'data:audio/wav;base64,test', duration: 1 });
    mockCacheAudio.mockResolvedValue(undefined);
  });

  it('should synthesize text and return result', async () => {
    const result = await synthesizeText('tere');

    expect(result).toMatchObject({
      originalText: 'tere',
      phoneticText: 'te`re',
      audioUrl: 'data:audio/wav;base64,test',
      cached: false,
    });
  });

  it('should return cached audio when available', async () => {
    mockGetCachedAudio.mockResolvedValue({
      hash: 'v1:mari:abc123',
      audioUrl: 'cached-audio-url',
      createdAt: '2024-01-01',
      expiresAt: '2025-01-01',
    });

    const result = await synthesizeText('tere');

    expect(result.audioUrl).toBe('cached-audio-url');
    expect(result.cached).toBe(true);
    expect(mockSynthesize).not.toHaveBeenCalled();
  });

  it('should cache new audio after synthesis', async () => {
    await synthesizeText('tere');

    expect(mockCacheAudio).toHaveBeenCalledWith(
      'v1:mari:abc123',
      'data:audio/wav;base64,test'
    );
  });

  it('should not fail if cache write fails', async () => {
    mockCacheAudio.mockRejectedValue(new Error('Cache error'));

    const result = await synthesizeText('tere');

    expect(result.audioUrl).toBe('data:audio/wav;base64,test');
  });
});

describe('synthesizeWithRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWithRetry.mockImplementation((fn) => fn());
  });

  it('should call withRetry with synthesizeText', async () => {
    mockAnalyzeText.mockResolvedValue({ words: [] });
    mockToPhoneticText.mockReturnValue('');
    mockGenerateCacheKey.mockReturnValue('key');
    mockGetCachedAudio.mockResolvedValue(null);
    mockSynthesize.mockResolvedValue({ audioUrl: 'test', duration: 1 });
    mockCacheAudio.mockResolvedValue(undefined);

    await synthesizeWithRetry('test');

    expect(mockWithRetry).toHaveBeenCalledWith(
      expect.any(Function),
      { maxRetries: 3 }
    );
  });

  it('should use custom maxRetries', async () => {
    mockAnalyzeText.mockResolvedValue({ words: [] });
    mockToPhoneticText.mockReturnValue('');
    mockGenerateCacheKey.mockReturnValue('key');
    mockGetCachedAudio.mockResolvedValue(null);
    mockSynthesize.mockResolvedValue({ audioUrl: 'test', duration: 1 });
    mockCacheAudio.mockResolvedValue(undefined);

    await synthesizeWithRetry('test', 5);

    expect(mockWithRetry).toHaveBeenCalledWith(
      expect.any(Function),
      { maxRetries: 5 }
    );
  });
});
