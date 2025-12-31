import { vi, type MockedFunction } from 'vitest';
// Mock config before imports to handle import.meta.env
vi.mock('../config', () => ({
  API_CONFIG: {
    audioApiUrl: 'https://api.example.com/audio',
    audioBucketUrl: 'https://bucket.example.com'
  }
}));

// Mock timers to avoid real delays
vi.useFakeTimers();

import { httpPost } from '../http';

import { synthesizeViaApi } from './audio-api';

// Mock dependencies
vi.mock('../http');

const mockHttpPost = httpPost as MockedFunction<typeof httpPost>;

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('audio-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('synthesizeViaApi', () => {
    it('should return URL immediately when response is ready', async () => {
      const expectedUrl = 'https://bucket.example.com/cache/test123.mp3';
      mockHttpPost.mockResolvedValueOnce({
        status: 'ready',
        url: expectedUrl,
        hash: 'test123'
      });

      const result = await synthesizeViaApi('test text');

      expect(result).toBe(expectedUrl);
      expect(mockHttpPost).toHaveBeenCalledWith(
        'https://api.example.com/audio',
        { text: 'test text' }
      );
    });

    it('should poll for audio when status is processing', async () => {
      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        hash: 'poll123'
      });

      // First poll returns 404, second returns 200
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = synthesizeViaApi('test text');
      
      // Advance timers for polling
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;
      expect(result).toBe('https://bucket.example.com/cache/poll123.mp3');
    });

    it('should return URL when fetch returns 206 partial content', async () => {
      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        hash: 'partial123'
      });

      mockFetch.mockResolvedValueOnce({ ok: false, status: 206 });

      const resultPromise = synthesizeViaApi('test text');
      await vi.advanceTimersByTimeAsync(100);

      const result = await resultPromise;
      expect(result).toBe('https://bucket.example.com/cache/partial123.mp3');
    });

    it('should continue polling on network error', async () => {
      mockHttpPost.mockResolvedValueOnce({
        status: 'processing',
        hash: 'error123'
      });

      // First poll throws error, second returns 200
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = synthesizeViaApi('test text');
      
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await resultPromise;
      expect(result).toBe('https://bucket.example.com/cache/error123.mp3');
    });
  });
});
