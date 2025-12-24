// Mock config before imports to handle import.meta.env
jest.mock('../config', () => ({
  API_CONFIG: {
    audioApiUrl: 'https://api.example.com/audio',
    audioBucketUrl: 'https://bucket.example.com'
  }
}));

// Mock timers to avoid real delays
jest.useFakeTimers();

import { httpPost } from '../http';

import { synthesizeViaApi } from './audio-api';

// Mock dependencies
jest.mock('../http');

const mockHttpPost = httpPost as jest.MockedFunction<typeof httpPost>;

// Mock fetch
declare global {
  var fetch: jest.Mock;
}
global.fetch = jest.fn();

describe('audio-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
