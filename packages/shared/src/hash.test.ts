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
      const expectedHash =
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
      const hashBuffer = new Uint8Array(
        (expectedHash.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)),
      ).buffer;

      const mockSubtle = { digest: jest.fn().mockResolvedValue(hashBuffer) };
      (globalThis as Record<string, unknown>).window = {
        crypto: { subtle: mockSubtle },
      };

      try {
        const hash = await calculateHash("test");
        expect(hash).toBe(expectedHash);
        expect(mockSubtle.digest).toHaveBeenCalledWith(
          "SHA-256",
          expect.any(Uint8Array),
        );
      } finally {
        delete (globalThis as Record<string, unknown>).window;
      }
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
