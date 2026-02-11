// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analyzeText, analyzeTextOrThrow } from "./analyzeApi";

describe("analyzeApi", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("analyzeText", () => {
    it("should return stressed text on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: "ˈtɛst" }),
      });

      const result = await analyzeText("test");
      expect(result).toBe("ˈtɛst");
      expect(mockFetch).toHaveBeenCalledWith("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "test" }),
      });
    });

    it("should return null if response not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      const result = await analyzeText("test");
      expect(result).toBeNull();
    });

    it("should return null if fetch throws", async () => {
      mockFetch.mockRejectedValue(
        new Error("Network error"),
      );
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await analyzeText("test");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return null if stressedText is empty", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: "" }),
      });

      const result = await analyzeText("test");
      expect(result).toBeNull();
    });
  });

  describe("analyzeTextOrThrow", () => {
    it("should return stressed text on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: "ˈtɛst" }),
      });

      const result = await analyzeTextOrThrow("test");
      expect(result).toBe("ˈtɛst");
    });

    it("should throw error if response not ok", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      await expect(analyzeTextOrThrow("test")).rejects.toThrow(
        "Analysis failed",
      );
    });

    it("should return original text if stressedText is empty", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: "" }),
      });

      const result = await analyzeTextOrThrow("test");
      expect(result).toBe("test");
    });

    it("should return original text if stressedText is null", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: null }),
      });

      const result = await analyzeTextOrThrow("fallback");
      expect(result).toBe("fallback");
    });

    it("sends correct request parameters", async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ stressedText: "result" }),
      });

      await analyzeTextOrThrow("hello world");
      expect(global.fetch).toHaveBeenCalledWith("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "hello world" }),
      });
    });
  });
});
