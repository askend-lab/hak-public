// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { synthesizeWithPolling } from "./synthesize";
import { AuthStorage } from "@/features/auth/services/storage";

vi.mock("@/utils/reportApiError", () => ({
  reportApiError: vi.fn(),
}));

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: {
    getAccessToken: vi.fn(),
  },
}));

describe("synthesize — auth gating (SEC-01)", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("T-F1: rejects when not authenticated", () => {
    it("throws AuthRequiredError when no access token is available", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue(null);

      await expect(synthesizeWithPolling("hello", "efm_l")).rejects.toThrow(
        "Authentication required",
      );
      // Should NOT call fetch at all
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("T-F2: sends auth header when authenticated", () => {
    it("includes Authorization: Bearer header in synthesize request", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("test-jwt-token");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: "cached",
          cacheKey: "k",
          audioUrl: "http://example.com/audio.wav",
        }),
      });

      await synthesizeWithPolling("hello", "efm_l");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/synthesize",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt-token",
          }),
        }),
      );
    });
  });

  describe("T-F3: polling sends auth header", () => {
    it("includes Authorization header in status polling requests", async () => {
      vi.useFakeTimers();
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("poll-token");

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: "processing",
            cacheKey: "test-key",
            audioUrl: null,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            status: "ready",
            cacheKey: "test-key",
            audioUrl: "http://example.com/audio.wav",
          }),
        });

      const promise = synthesizeWithPolling("hello", "efm_l");
      await vi.advanceTimersByTimeAsync(2000);
      await promise;

      // Second call is the status poll
      expect(mockFetch.mock.calls).toHaveLength(2);
      const [statusUrl, statusOpts] = mockFetch.mock.calls[1] as [string, RequestInit];
      expect(statusUrl).toBe("/api/status/test-key");
      expect(statusOpts).toEqual(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer poll-token",
          }),
        }),
      );

      vi.useRealTimers();
    });
  });

  describe("T-F4: 401 response triggers login redirect", () => {
    it("throws AuthRequiredError on 401 from synthesize endpoint", async () => {
      vi.mocked(AuthStorage.getAccessToken).mockReturnValue("expired-token");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(synthesizeWithPolling("hello", "efm_l")).rejects.toThrow(
        "Authentication required",
      );
    });
  });
});
