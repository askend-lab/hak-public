import { vi, type MockedFunction } from 'vitest';
import { httpGet, httpPost, HttpError } from '../http';

import { getCachedAudio, cacheAudio, generateCacheKey } from './cache';

vi.mock('../http');
vi.mock('../config', () => ({
  API_CONFIG: { cacheUrl: '/api/cache' },
}));

const mockHttpGet = httpGet as MockedFunction<typeof httpGet>;
const mockHttpPost = httpPost as MockedFunction<typeof httpPost>;

describe('Audio Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      const key = await generateCacheKey('hello', 'efm_s');
      expect(key).toMatch(/^v1:efm_s:/);
    });

    it('should generate cache key with custom version', async () => {
      const key = await generateCacheKey('hello', 'efm_l', 'v2');
      expect(key).toMatch(/^v2:efm_l:/);
    });

    it('should generate different keys for different texts', async () => {
      const key1 = await generateCacheKey('hello', 'efm_s');
      const key2 = await generateCacheKey('world', 'efm_s');
      expect(key1).not.toBe(key2);
    });
  });
});
