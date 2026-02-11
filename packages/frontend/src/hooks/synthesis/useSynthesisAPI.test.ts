// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisAPI } from "./useSynthesisAPI";

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("mock-audio-url"),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: (): string => "mari",
}));

describe("useSynthesisAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("analyzeText", () => {
    it("calls /api/analyze and returns result", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "te`re" }),
      });

      const { result } = renderHook(() => useSynthesisAPI());
      let res: { stressedText: string } | undefined;
      await act(async () => {
        res = await result.current.analyzeText("tere");
      });

      expect(res?.stressedText).toBe("te`re");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/analyze",
        expect.any(Object),
      );
    });

    it("throws on failed analysis", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useSynthesisAPI());
      await expect(
        act(async () => {
          await result.current.analyzeText("tere");
        }),
      ).rejects.toThrow("Analysis failed");
    });
  });

  describe("synthesizeText", () => {
    it("uses provided phoneticText", async () => {
      const { result } = renderHook(() => useSynthesisAPI());
      let res:
        | {
            audioUrl: string;
            phoneticText: string;
            stressedTags?: string[] | undefined;
          }
        | undefined;
      await act(async () => {
        res = await result.current.synthesizeText("tere", "te`re");
      });

      expect(res?.audioUrl).toBe("mock-audio-url");
      expect(res?.phoneticText).toBe("te`re");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("analyzes text when no phoneticText provided", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "te`re maailm" }),
      });

      const { result } = renderHook(() => useSynthesisAPI());
      let res:
        | {
            audioUrl: string;
            phoneticText: string;
            stressedTags?: string[] | undefined;
          }
        | undefined;
      await act(async () => {
        res = await result.current.synthesizeText("tere maailm");
      });

      expect(res?.phoneticText).toBe("te`re maailm");
      expect(res?.stressedTags).toStrictEqual(["te`re", "maailm"]);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe("synthesizeWithCache", () => {
    it("returns cached result when both audioUrl and phoneticText provided", async () => {
      const { result } = renderHook(() => useSynthesisAPI());
      let res: { audioUrl: string; phoneticText: string } | undefined;
      await act(async () => {
        res = await result.current.synthesizeWithCache(
          "tere",
          "te`re",
          "cached-url",
        );
      });

      expect(res?.audioUrl).toBe("cached-url");
      expect(res?.phoneticText).toBe("te`re");
    });

    it("synthesizes when no cached audio", async () => {
      const { result } = renderHook(() => useSynthesisAPI());
      let res: { audioUrl: string; phoneticText: string } | undefined;
      await act(async () => {
        res = await result.current.synthesizeWithCache("tere", "te`re", null);
      });

      expect(res?.audioUrl).toBe("mock-audio-url");
    });

    it("synthesizes when no cached phoneticText", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "te`re" }),
      });
      const { result } = renderHook(() => useSynthesisAPI());
      let res: { audioUrl: string; phoneticText: string } | undefined;
      await act(async () => {
        res = await result.current.synthesizeWithCache("tere", null, "cached-url");
      });

      expect(res?.audioUrl).toBe("mock-audio-url");
      expect(res?.phoneticText).toBe("te`re");
    });
  });

  describe("analyzeText request details", () => {
    it("sends correct request parameters", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "te`re" }),
      });

      const { result } = renderHook(() => useSynthesisAPI());
      await act(async () => {
        await result.current.analyzeText("tere");
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "tere" }),
      });
    });
  });

  describe("synthesizeText edge cases", () => {
    it("falls back to original text when stressedText is empty", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stressedText: "" }),
      });

      const { result } = renderHook(() => useSynthesisAPI());
      let res: { phoneticText: string; stressedTags?: string[] | undefined } | undefined;
      await act(async () => {
        res = await result.current.synthesizeText("tere");
      });

      expect(res?.phoneticText).toBe("tere");
      expect(res?.stressedTags).toBeUndefined();
    });

    it("does not set stressedTags when phoneticText is provided", async () => {
      const { result } = renderHook(() => useSynthesisAPI());
      let res: { stressedTags?: string[] | undefined } | undefined;
      await act(async () => {
        res = await result.current.synthesizeText("tere", "te`re");
      });

      expect(res?.stressedTags).toBeUndefined();
    });
  });
});
