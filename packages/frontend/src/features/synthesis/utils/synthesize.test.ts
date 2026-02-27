// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { synthesizeWithPolling } from "./synthesize";

describe("synthesize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("synthesizeWithPolling", () => {
    it("returns audioUrl when status is cached", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "cached",
            cacheKey: "test-key",
            audioUrl: "http://example.com/audio.wav",
          }),
      });

      const result = await synthesizeWithPolling("hello", "efm_l");
      expect(result).toBe("http://example.com/audio.wav");
    });

    it("returns audioUrl when status is ready", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "ready",
            cacheKey: "test-key",
            audioUrl: "http://example.com/audio.wav",
          }),
      });

      const result = await synthesizeWithPolling("hello", "efm_l");
      expect(result).toBe("http://example.com/audio.wav");
    });

    it("throws error when synthesis request fails", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      await expect(synthesizeWithPolling("hello", "efm_l")).rejects.toThrow(
        "Synthesis request failed",
      );
    });

    it("polls for audio when status is processing", async () => {
      vi.useFakeTimers();

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "processing",
              cacheKey: "test-key",
              audioUrl: null,
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ready",
              cacheKey: "test-key",
              audioUrl: "http://example.com/audio.wav",
            }),
        });

      const promise = synthesizeWithPolling("hello", "efm_l");
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;
      expect(result).toBe("http://example.com/audio.wav");

      vi.useRealTimers();
    });

    it("retries polling on transient network error", async () => {
      vi.useFakeTimers();

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "processing",
              cacheKey: "test-key",
              audioUrl: null,
            }),
        })
        // Network error on first poll
        .mockRejectedValueOnce(new TypeError("Failed to fetch"))
        // Successful poll after retry
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "ready",
              cacheKey: "test-key",
              audioUrl: "http://example.com/audio.wav",
            }),
        });

      const promise = synthesizeWithPolling("hello", "efm_l");
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);
      const result = await promise;
      expect(result).toBe("http://example.com/audio.wav");

      vi.useRealTimers();
    });

  });
});
