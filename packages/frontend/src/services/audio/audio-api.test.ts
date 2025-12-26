import { vi, type Mock, type MockedFunction } from 'vitest';
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
declare global {
  var fetch: Mock;
}
global.fetch = vi.fn();

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
  });
});
