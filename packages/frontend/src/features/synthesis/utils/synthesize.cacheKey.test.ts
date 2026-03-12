// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi } from "vitest";

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: { getAccessToken: vi.fn(() => null) },
}));

describe("computeCacheKey", () => {
  it("should be exported from synthesize module", async () => {
    const mod = await import("./synthesize");
    expect(typeof mod.computeCacheKey).toBe("function");
  });

  it("should return a 64-char hex string (sha256)", async () => {
    const { computeCacheKey } = await import("./synthesize");
    const key = await computeCacheKey("hello", "efm_s");
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should match backend key format: SHA256(text|voice|1|0)", async () => {
    const { computeCacheKey } = await import("./synthesize");
    // Compute expected value using Web Crypto API (same as test env)
    const input = "hello|efm_s|1|0";
    const buffer = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    const expected = [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
    const key = await computeCacheKey("hello", "efm_s");
    expect(key).toBe(expected);
  });

  it("should return different keys for different text", async () => {
    const { computeCacheKey } = await import("./synthesize");
    const key1 = await computeCacheKey("hello", "efm_s");
    const key2 = await computeCacheKey("world", "efm_s");
    expect(key1).not.toBe(key2);
  });

  it("should return different keys for different voice", async () => {
    const { computeCacheKey } = await import("./synthesize");
    const key1 = await computeCacheKey("hello", "efm_s");
    const key2 = await computeCacheKey("hello", "efm_l");
    expect(key1).not.toBe(key2);
  });

  it("should return consistent hash for same input", async () => {
    const { computeCacheKey } = await import("./synthesize");
    const key1 = await computeCacheKey("läks", "efm_s");
    const key2 = await computeCacheKey("läks", "efm_s");
    expect(key1).toBe(key2);
  });
});
