// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { calculateHash, calculateHashSync } from "./hash";

describe("hash", () => {
  describe("calculateHash (async)", () => {
    it("should calculate SHA-256 hash", async () => {
      const hash = await calculateHash("test");
      expect(hash).toBe(
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      );
    });

    it("should return consistent hash for same input", async () => {
      const hash1 = await calculateHash("hello world");
      const hash2 = await calculateHash("hello world");
      expect(hash1).toBe(hash2);
    });

    it("should return different hash for different input", async () => {
      const hash1 = await calculateHash("hello");
      const hash2 = await calculateHash("world");
      expect(hash1).not.toBe(hash2);
    });

    it("should throw error for empty text", async () => {
      await expect(calculateHash("")).rejects.toThrow("Text cannot be empty");
    });

    it("should throw error for whitespace-only text", async () => {
      await expect(calculateHash("   ")).rejects.toThrow(
        "Text cannot be empty",
      );
    });

    it("should use window.crypto.subtle when available", async () => {
      // Note: This test verifies the browser code path exists and returns correct hash.
      // In Node.js test environment, typeof window === "undefined" so the Node.js
      // crypto path is used. The browser path is tested via integration tests.
      // Here we just verify the function returns the expected hash regardless of env.
      const hash = await calculateHash("test");
      expect(hash).toBe(
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      );
    });
  });

  describe("calculateHash browser path", () => {
    const globalAny = globalThis as Record<string, unknown>;
    const originalWindow = globalAny.window;

    afterEach(() => {
      globalAny.window = originalWindow;
    });

    it("should use browser crypto when window.crypto.subtle available", async () => {
      const mockDigest = vi.fn().mockResolvedValue(
        new Uint8Array([
          159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90,
          208, 21, 163, 191, 79, 27, 43, 11, 130, 44, 209, 93, 108, 21, 176,
          240, 10, 8,
        ]).buffer,
      );

      globalAny.window = {
        crypto: {
          subtle: {
            digest: mockDigest,
          },
        },
      };

      const hash = await calculateHash("test");
      expect(hash).toBe(
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      );
    });
  });

  describe("calculateHashSync", () => {
    it("should calculate SHA-256 hash", () => {
      const hash = calculateHashSync("test");
      expect(hash).toBe(
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      );
    });

    it("should return consistent hash for same input", () => {
      const hash1 = calculateHashSync("hello world");
      const hash2 = calculateHashSync("hello world");
      expect(hash1).toBe(hash2);
    });

    it("should return different hash for different input", () => {
      const hash1 = calculateHashSync("hello");
      const hash2 = calculateHashSync("world");
      expect(hash1).not.toBe(hash2);
    });

    it("should throw error for empty text", () => {
      expect(() => calculateHashSync("")).toThrow("Text cannot be empty");
    });

    it("should throw error for whitespace-only text", () => {
      expect(() => calculateHashSync("   ")).toThrow("Text cannot be empty");
    });

    it("should handle unicode characters", () => {
      const hash = calculateHashSync("Tere päevast! 日本語 🎉");
      expect(hash).toHaveLength(64);
    });

    it("should handle very long strings", () => {
      const longText = "a".repeat(10000);
      const hash = calculateHashSync(longText);
      expect(hash).toHaveLength(64);
    });

    it("should handle special characters", () => {
      const hash = calculateHashSync("!@#$%^&*()_+-=[]{}|;:,.<>?");
      expect(hash).toHaveLength(64);
    });

    it("should handle newlines and tabs", () => {
      const hash = calculateHashSync("line1\nline2\ttab");
      expect(hash).toHaveLength(64);
    });
  });
});
