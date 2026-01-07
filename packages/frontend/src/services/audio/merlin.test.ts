import { vi, type MockedFunction } from 'vitest';
// Mock config before imports to handle import.meta.env
vi.mock('../config', () => ({
  API_CONFIG: {
    merlinUrl: 'https://merlin.example.com'
  }
}));

import { httpPost, httpGet } from '../http';

import { synthesize, synthesizeToBlob } from './merlin';

import type { MerlinRequest } from './types';

// Mock dependencies
vi.mock('../http');

const mockHttpPost = httpPost as MockedFunction<typeof httpPost>;
const mockHttpGet = httpGet as MockedFunction<typeof httpGet>;

describe('merlin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('synthesize', () => {
    it('should return cached audio URL immediately', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      mockHttpPost.mockResolvedValueOnce({
        status: 'cached',
        cacheKey: 'test-key',
        audioUrl: 'https://example.com/audio.wav'
      });

      const result = await synthesize(mockRequest);

      expect(result).toStrictEqual({
        audioUrl: 'https://example.com/audio.wav',
        duration: 0
      });

      expect(mockHttpPost).toHaveBeenCalledWith(
        'https://merlin.example.com/synthesize',
        {
          text: 'test text',
          voice: 'efm_s'
        }
      );
    });

    it('should poll for audio when processing', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        cacheKey: 'test-key',
        audioUrl: null
      });

      mockHttpGet.mockResolvedValueOnce({
        status: 'ready',
        cacheKey: 'test-key',
        audioUrl: 'https://example.com/audio.wav'
      });

      const result = await synthesize(mockRequest);

      expect(result).toStrictEqual({
        audioUrl: 'https://example.com/audio.wav',
        duration: 0
      });

      expect(mockHttpGet).toHaveBeenCalledWith(
        'https://merlin.example.com/status/test-key'
      );
    });

    it('should throw error on synthesis failure', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        cacheKey: 'test-key',
        audioUrl: null
      });

      mockHttpGet.mockResolvedValueOnce({
        status: 'error',
        cacheKey: 'test-key',
        audioUrl: null,
        error: 'Synthesis failed'
      });

      await expect(synthesize(mockRequest)).rejects.toThrow('Synthesis failed');
    });
  });

  describe('synthesizeToBlob', () => {
    it('should return blob from audio URL', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      mockHttpPost.mockResolvedValueOnce({
        status: 'cached',
        cacheKey: 'test-key',
        audioUrl: 'https://example.com/audio.wav'
      });

      const mockBlob = new Blob(['test'], { type: 'audio/wav' });
      const mockFetch = vi.fn().mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob)
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await synthesizeToBlob(mockRequest);

      expect(result).toBe(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/audio.wav');
    });

    it('should handle polling before fetching blob', async () => {
      const mockRequest: MerlinRequest = {
        text: 'complex text',
        voice: 'efm_l',
      };

      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        cacheKey: 'complex-key',
        audioUrl: null
      });

      mockHttpGet.mockResolvedValueOnce({
        status: 'ready',
        cacheKey: 'complex-key',
        audioUrl: 'https://example.com/complex.wav'
      });

      const mockBlob = new Blob(['complex'], { type: 'audio/wav' });
      const mockFetch = vi.fn().mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob)
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await synthesizeToBlob(mockRequest);

      expect(result).toBe(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/complex.wav');
    });
  });
});
