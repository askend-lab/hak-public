// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { synthesizeWithPolling } from "./synthesize";
import { reportApiError } from "@/utils/reportApiError";

vi.mock("@/utils/reportApiError", () => ({
  reportApiError: vi.fn(),
}));

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: {
    getAccessToken: vi.fn(() => "test-token"),
  },
}));

describe("synthesize - part 2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("synthesizeWithPolling error handling", () => {
    it("throws error when polling status check fails", async () => {
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
          ok: false,
          status: 502,
        });

      await expect(synthesizeWithPolling("hello", "efm_l")).rejects.toThrow(
        "Status check failed",
      );
      expect(reportApiError).toHaveBeenCalledWith({
        context: "Status check failed",
        status: 502,
        url: "/api/status/test-key",
      });
    });

    it("throws error when synthesis returns error status", async () => {
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
              status: "error",
              cacheKey: "test-key",
              audioUrl: null,
              error: "Synthesis failed",
            }),
        });

      await expect(synthesizeWithPolling("hello", "efm_l")).rejects.toThrow(
        "Synthesis failed",
      );
    });

    it("uses efm_s model for short text", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "ready",
            cacheKey: "k",
            audioUrl: "http://a.wav",
          }),
      });
      await synthesizeWithPolling("hi", "efm_s");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/synthesize",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("efm_s"),
        }),
      );
    });

    it("throws timeout error after max poll attempts", async () => {
      vi.useFakeTimers();

      const fetchMock = global.fetch as ReturnType<typeof vi.fn>;
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            status: "processing",
            cacheKey: "k",
            audioUrl: null,
          }),
      });
      for (let i = 0; i < 30; i++) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "processing",
              cacheKey: "k",
              audioUrl: null,
            }),
        });
      }

      const promise = synthesizeWithPolling("test", "efm_l");
      const safePromise = promise.catch(() => {});
      for (let i = 0; i < 30; i++) {
        await vi.advanceTimersByTimeAsync(8000);
      }
      await safePromise;

      await expect(promise).rejects.toThrow("Synthesis timed out");
      expect(reportApiError).toHaveBeenCalledWith({
        context: "Synthesis timed out",
        status: 0,
        url: "/api/synthesize",
        body: "cacheKey=k, attempts=30",
      });
      vi.useRealTimers();
    });

    it("handles empty error message", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              status: "processing",
              cacheKey: "k",
              audioUrl: null,
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ status: "error", cacheKey: "k", audioUrl: null }),
        });
      await expect(synthesizeWithPolling("test", "efm_l")).rejects.toThrow(
        "Synthesis failed",
      );
    });
  });
});
