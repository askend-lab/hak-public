import { synthesizeViaApi } from './audio-api';

jest.mock('../http', () => ({
  httpPost: jest.fn(),
}));

jest.mock('../config', () => ({
  API_CONFIG: {
    audioApiUrl: 'http://test-api/generate',
    audioBucketUrl: 'http://test-bucket',
  },
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { httpPost } from '../http';

describe('audio-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('synthesizeViaApi', () => {
    it('should return url immediately if status is ready', async () => {
      (httpPost as jest.Mock).mockResolvedValue({
        status: 'ready',
        url: 'http://test-bucket/audio.mp3',
        hash: 'abc123',
      });

      const result = await synthesizeViaApi('Hello');
      expect(result).toBe('http://test-bucket/audio.mp3');
    });

    it('should poll for audio if status is processing', async () => {
      (httpPost as jest.Mock).mockResolvedValue({
        status: 'processing',
        hash: 'abc123',
      });

      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await synthesizeViaApi('Hello');
      expect(result).toBe('http://test-bucket/cache/abc123.mp3');
    });
  });
});
