import { httpGet, httpPost, HttpError } from '../http';

import { getCachedAudio, cacheAudio, generateCacheKey } from './cache';

jest.mock('../http');
jest.mock('../config', () => ({
  API_CONFIG: { cacheUrl: '/api/cache' },
}));

const mockHttpGet = httpGet as jest.MockedFunction<typeof httpGet>;
const mockHttpPost = httpPost as jest.MockedFunction<typeof httpPost>;

describe('Audio Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCachedAudio', () => {
    it('should return cached audio entry', async () => {
      const mockEntry = { hash: 'abc123', audioUrl: 'data:audio/wav;base64,...' };
      mockHttpGet.mockResolvedValue(mockEntry);

      const result = await getCachedAudio('abc123');
      expect(result).toStrictEqual(mockEntry);
      expect(mockHttpGet).toHaveBeenCalledWith('/api/cache/abc123');
    });

    it('should return null on 404', async () => {
      mockHttpGet.mockRejectedValue(new HttpError(404, 'Not found'));

      const result = await getCachedAudio('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null on other errors', async () => {
      mockHttpGet.mockRejectedValue(new Error('Network error'));

      const result = await getCachedAudio('abc123');
      expect(result).toBeNull();
    });
  });

  describe('cacheAudio', () => {
    it('should cache audio with default TTL', async () => {
      mockHttpPost.mockResolvedValue(undefined);

      await cacheAudio('hash123', 'data:audio/wav;base64,...');
      
      expect(mockHttpPost).toHaveBeenCalledWith('/api/cache', expect.objectContaining({
        hash: 'hash123',
        audioUrl: 'data:audio/wav;base64,...',
      }));
    });

    it('should cache audio with custom TTL', async () => {
      mockHttpPost.mockResolvedValue(undefined);

      await cacheAudio('hash123', 'data:audio/wav;base64,...', 30);
      
      expect(mockHttpPost).toHaveBeenCalled();
    });
  });

  describe('generateCacheKey', () => {
    it('should generate cache key with default version', async () => {
      const key = await generateCacheKey('hello', 'mari');
      expect(key).toMatch(/^v1:mari:/);
    });

    it('should generate cache key with custom version', async () => {
      const key = await generateCacheKey('hello', 'tambet', 'v2');
      expect(key).toMatch(/^v2:tambet:/);
    });

    it('should generate different keys for different texts', async () => {
      const key1 = await generateCacheKey('hello', 'mari');
      const key2 = await generateCacheKey('world', 'mari');
      expect(key1).not.toBe(key2);
    });
  });
});
