// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisAPI } from "./useSynthesisAPI";
import { AuthRequiredError } from "@/features/synthesis/utils/synthesize";

vi.mock("@/features/synthesis/utils/synthesize", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/synthesis/utils/synthesize")>();
  return {
    ...actual,
    synthesizeAuto: vi.fn().mockResolvedValue({ audioUrl: "mock-audio-url", cacheKey: "mock-cache-key" }),
  };
});

vi.mock("@/types/synthesis", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/types/synthesis")>();
  return { ...actual, getVoiceModel: (): string => "mari" };
});

const mockGetAccessToken = vi.fn();

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: {
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
    getUser: vi.fn(() => null),
    getIdToken: vi.fn(() => null),
    setUser: vi.fn(),
    setAccessToken: vi.fn(),
    setIdToken: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("useSynthesisAPI auth handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyzeText sends Authorization header", () => {
    it("should include Authorization header when token exists", async () => {
      mockGetAccessToken.mockReturnValue("test-token-123");
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "te`re" }),
      });

      const { result } = renderHook(() => useSynthesisAPI());
      await act(async () => {
        await result.current.analyzeText("tere");
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/analyze",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token-123",
          }),
        }),
      );
    });
  });

  describe("analyzeText throws AuthRequiredError on 401", () => {
    it("should throw AuthRequiredError when API returns 401", async () => {
      mockGetAccessToken.mockReturnValue("expired-token");
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useSynthesisAPI());

      await expect(
        act(async () => {
          await result.current.analyzeText("tere");
        }),
      ).rejects.toThrow(AuthRequiredError);
    });

    it("should dispatch auth-required event on 401", async () => {
      mockGetAccessToken.mockReturnValue("expired-token");
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const handler = vi.fn();
      window.addEventListener("auth-required", handler);

      const { result } = renderHook(() => useSynthesisAPI());
      try {
        await act(async () => {
          await result.current.analyzeText("tere");
        });
      } catch { /* expected */ }

      expect(handler).toHaveBeenCalled();
      window.removeEventListener("auth-required", handler);
    });
  });

  describe("analyzeText throws AuthRequiredError when no token", () => {
    it("should throw AuthRequiredError when no access token exists", async () => {
      mockGetAccessToken.mockReturnValue(null);

      const { result } = renderHook(() => useSynthesisAPI());

      await expect(
        act(async () => {
          await result.current.analyzeText("tere");
        }),
      ).rejects.toThrow(AuthRequiredError);
    });
  });
});
