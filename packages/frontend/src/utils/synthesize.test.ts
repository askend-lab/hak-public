import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { synthesizeWithPolling } from './synthesize';

describe('synthesize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('synthesizeWithPolling', () => {
    it('returns audioUrl when status is cached', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'cached',
          cacheKey: 'test-key',
          audioUrl: 'http://example.com/audio.wav',
        }),
      });

      const result = await synthesizeWithPolling('hello', 'efm_l');
      expect(result).toBe('http://example.com/audio.wav');
    });

    it('returns audioUrl when status is ready', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'ready',
          cacheKey: 'test-key',
          audioUrl: 'http://example.com/audio.wav',
        }),
      });

      const result = await synthesizeWithPolling('hello', 'efm_l');
      expect(result).toBe('http://example.com/audio.wav');
    });

    it('throws error when synthesis request fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      await expect(synthesizeWithPolling('hello', 'efm_l')).rejects.toThrow('Synthesis request failed');
    });

    it('polls for audio when status is processing', async () => {
      vi.useFakeTimers();

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'processing',
            cacheKey: 'test-key',
            audioUrl: null,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'ready',
            cacheKey: 'test-key',
            audioUrl: 'http://example.com/audio.wav',
          }),
        });

      const promise = synthesizeWithPolling('hello', 'efm_l');
      await vi.advanceTimersByTimeAsync(1000);
      
      const result = await promise;
      expect(result).toBe('http://example.com/audio.wav');

      vi.useRealTimers();
    });

    it('throws error when polling status check fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'processing',
            cacheKey: 'test-key',
            audioUrl: null,
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
        });

      await expect(synthesizeWithPolling('hello', 'efm_l')).rejects.toThrow('Status check failed');
    });

    it('throws error when synthesis returns error status', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'processing',
            cacheKey: 'test-key',
            audioUrl: null,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: 'error',
            cacheKey: 'test-key',
            audioUrl: null,
            error: 'Synthesis failed',
          }),
        });

      await expect(synthesizeWithPolling('hello', 'efm_l')).rejects.toThrow('Synthesis failed');
    });

    it('uses efm_s model for short text', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ready', cacheKey: 'k', audioUrl: 'http://a.wav' }),
      });
      await synthesizeWithPolling('hi', 'efm_s');
      expect(global.fetch).toHaveBeenCalledWith('/api/synthesize', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('efm_s'),
      }));
    });

    it('handles empty error message', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'processing', cacheKey: 'k', audioUrl: null }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'error', cacheKey: 'k', audioUrl: null }),
        });
      await expect(synthesizeWithPolling('test', 'efm_l')).rejects.toThrow('Synthesis failed');
    });
  });
});
