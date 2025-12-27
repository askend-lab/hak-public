import { vi, type MockedFunction } from 'vitest';
import { httpPost } from '../http';

import { analyzeText, toPhoneticText, getWordVariants } from './vabamorf';

vi.mock('../http');
vi.mock('../config', () => ({
  API_CONFIG: { vabamorfUrl: '/api/vabamorf' },
}));

const mockHttpPost = httpPost as MockedFunction<typeof httpPost>;

describe('Vabamorf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeText', () => {
    it('should analyze text and return word analysis', async () => {
      mockHttpPost.mockResolvedValue({
        originalText: 'tere maailm',
        stressedText: 'te`re maa`ilm',
      });

      const result = await analyzeText('tere maailm');
      
      expect(result.words).toHaveLength(2);
      expect(result.words[0]?.text).toBe('tere');
      expect(result.words[0]?.phonetic).toBe('te`re');
      expect(result.words[1]?.text).toBe('maailm');
      expect(result.words[1]?.phonetic).toBe('maa`ilm');
    });
  });

  describe('toPhoneticText', () => {
    it('should convert response to phonetic text', () => {
      const response = {
        words: [
          { text: 'tere', phonetic: 'te`re', stress: 1 },
          { text: 'maailm', phonetic: 'maa`ilm', stress: 1 },
        ],
      };

      const result = toPhoneticText(response);
      expect(result).toBe('te`re maa`ilm');
    });

    it('should handle empty words array', () => {
      const response = { words: [] };
      const result = toPhoneticText(response);
      expect(result).toBe('');
    });
  });

  describe('getWordVariants', () => {
    it('should return word variants if available', () => {
      const response = {
        words: [
          { 
            text: 'tere', 
            phonetic: 'te`re', 
            stress: 1,
            variants: [
              { phonetic: 'te`re', stress: 1 },
              { phonetic: 'tere`', stress: 2 },
            ],
          },
        ],
      };

      const variants = getWordVariants(response, 0);
      expect(variants).toHaveLength(2);
    });

    it('should return default variant if no variants', () => {
      const response = {
        words: [{ text: 'tere', phonetic: 'te`re', stress: 1 }],
      };

      const variants = getWordVariants(response, 0);
      expect(variants).toHaveLength(1);
      expect(variants[0]?.phonetic).toBe('te`re');
    });

    it('should return empty array for invalid index', () => {
      const response = { words: [] };
      const variants = getWordVariants(response, 5);
      expect(variants).toStrictEqual([]);
    });
  });
});
