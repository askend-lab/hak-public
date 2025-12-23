import { synthesize, synthesizeToBlob } from './merlin';

jest.mock('../http', () => ({
  httpPost: jest.fn(),
  httpPostBlob: jest.fn(),
}));

jest.mock('../config', () => ({
  API_CONFIG: {
    merlinUrl: 'http://test-merlin/synthesize',
  },
}));

import { httpPost, httpPostBlob } from '../http';

describe('merlin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('synthesize', () => {
    it('should return audio URL from base64 response', async () => {
      (httpPost as jest.Mock).mockResolvedValue({
        audio: 'dGVzdA==',
        format: 'wav',
      });

      const result = await synthesize({ text: 'Hello', voice: 'mari' });
      
      expect(result.audioUrl).toBe('data:audio/wav;base64,dGVzdA==');
      expect(result.duration).toBe(0);
    });

    it('should call httpPost with correct params', async () => {
      (httpPost as jest.Mock).mockResolvedValue({ audio: 'test', format: 'wav' });

      await synthesize({ text: 'Hello', voice: 'mari' });

      expect(httpPost).toHaveBeenCalledWith(
        'http://test-merlin/synthesize',
        { text: 'Hello', voice: 'mari', returnBase64: true }
      );
    });
  });

  describe('synthesizeToBlob', () => {
    it('should call httpPostBlob with format blob', async () => {
      const mockBlob = new Blob(['test']);
      (httpPostBlob as jest.Mock).mockResolvedValue(mockBlob);

      const result = await synthesizeToBlob({ text: 'Hello', voice: 'mari' });

      expect(result).toBe(mockBlob);
      expect(httpPostBlob).toHaveBeenCalledWith(
        'http://test-merlin/synthesize',
        { text: 'Hello', voice: 'mari', format: 'blob' }
      );
    });
  });
});
