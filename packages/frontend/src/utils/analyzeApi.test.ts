import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeText, analyzeTextOrThrow } from './analyzeApi';

describe('analyzeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeText', () => {
    it('should return stressed text on success', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: 'ˈtɛst' })
      });

      const result = await analyzeText('test');
      expect(result).toBe('ˈtɛst');
      expect(global.fetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      });
    });

    it('should return null if response not ok', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false
      });

      const result = await analyzeText('test');
      expect(result).toBeNull();
    });

    it('should return null if fetch throws', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await analyzeText('test');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return null if stressedText is empty', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: '' })
      });

      const result = await analyzeText('test');
      expect(result).toBeNull();
    });
  });

  describe('analyzeTextOrThrow', () => {
    it('should return stressed text on success', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: 'ˈtɛst' })
      });

      const result = await analyzeTextOrThrow('test');
      expect(result).toBe('ˈtɛst');
    });

    it('should throw error if response not ok', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false
      });

      await expect(analyzeTextOrThrow('test')).rejects.toThrow('Analysis failed');
    });

    it('should return original text if stressedText is empty', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: '' })
      });

      const result = await analyzeTextOrThrow('test');
      expect(result).toBe('test');
    });
  });
});
