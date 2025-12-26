import { vi, type MockedFunction } from 'vitest';
// Mock config before imports to handle import.meta.env
vi.mock('../config', () => ({
  API_CONFIG: {
    merlinUrl: 'https://merlin.example.com/synthesize'
  }
}));

import { httpPost, httpPostBlob } from '../http';

import { synthesize, synthesizeToBlob } from './merlin';

import type { MerlinRequest } from './types';

// Mock dependencies
vi.mock('../http');

const mockHttpPost = httpPost as MockedFunction<typeof httpPost>;
const mockHttpPostBlob = httpPostBlob as MockedFunction<typeof httpPostBlob>;

describe('merlin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('synthesize', () => {
    it('should return audio URL with base64 data', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      const mockEkiResponse = {
        audio: 'dGVzdCBhdWRpbyBkYXRh', // base64 encoded 'test audio data'
        format: 'wav'
      };

      mockHttpPost.mockResolvedValueOnce(mockEkiResponse);

      const result = await synthesize(mockRequest);

      expect(result).toStrictEqual({
        audioUrl: 'data:audio/wav;base64,dGVzdCBhdWRpbyBkYXRh',
        duration: 0
      });

      expect(mockHttpPost).toHaveBeenCalledWith(
        'https://merlin.example.com/synthesize',
        {
          text: 'test text',
          voice: 'efm_s',
          returnBase64: true
        }
      );
    });

    it('should work with blob format parameter', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      const mockEkiResponse = {
        audio: 'YmxvYiBkYXRh', // base64 encoded 'blob data'
        format: 'wav'
      };

      mockHttpPost.mockResolvedValueOnce(mockEkiResponse);

      const result = await synthesize(mockRequest, 'blob');

      expect(result).toStrictEqual({
        audioUrl: 'data:audio/wav;base64,YmxvYiBkYXRh',
        duration: 0
      });
    });

    it('should handle empty audio data', async () => {
      const mockRequest: MerlinRequest = {
        text: '',
        voice: 'efm_s'
      };

      mockHttpPost.mockResolvedValueOnce({
        audio: '',
        format: 'wav'
      });

      const result = await synthesize(mockRequest);

      expect(result).toStrictEqual({
        audioUrl: 'data:audio/wav;base64,',
        duration: 0
      });
    });
  });

  describe('synthesizeToBlob', () => {
    it('should return blob response', async () => {
      const mockRequest: MerlinRequest = {
        text: 'test text',
        voice: 'efm_s'
      };

      const mockBlob = new Blob(['test'], { type: 'audio/wav' });
      mockHttpPostBlob.mockResolvedValueOnce(mockBlob);

      const result = await synthesizeToBlob(mockRequest);

      expect(result).toBe(mockBlob);

      expect(mockHttpPostBlob).toHaveBeenCalledWith(
        'https://merlin.example.com/synthesize',
        {
          text: 'test text',
          voice: 'efm_s',
          format: 'blob'
        }
      );
    });

    it('should pass all request parameters correctly', async () => {
      const mockRequest: MerlinRequest = {
        text: 'complex text',
        voice: 'efm_l',
      };

      const mockBlob = new Blob(['complex'], { type: 'audio/wav' });
      mockHttpPostBlob.mockResolvedValueOnce(mockBlob);

      await synthesizeToBlob(mockRequest);

      expect(mockHttpPostBlob).toHaveBeenCalledWith(
        'https://merlin.example.com/synthesize',
        {
          text: 'complex text',
          voice: 'efm_l',
          format: 'blob'
        }
      );
    });
  });
});
