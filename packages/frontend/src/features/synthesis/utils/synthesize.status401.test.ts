// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/features/auth/services/storage", () => ({
  AuthStorage: { getAccessToken: vi.fn(() => null) },
}));

vi.mock("@/utils/reportApiError", () => ({ reportApiError: vi.fn() }));
vi.mock("@/utils/apiErrorEvents", () => ({ checkApiErrorStatus: vi.fn(), dispatchApiError: vi.fn() }));

describe("checkCachedAudio handles 401 gracefully", () => {
  let authRequiredEvents: Event[];

  beforeEach(() => {
    vi.clearAllMocks();
    authRequiredEvents = [];
    window.addEventListener("auth-required", (e) => authRequiredEvents.push(e));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.removeEventListener("auth-required", () => {});
  });

  it("should return null (not throw) when /status returns 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, ok: false }));

    const { checkCachedAudio } = await import("./synthesize");
    const result = await checkCachedAudio("abc123def456abc123def456abc123def456abc123def456abc123def456abc123de");

    expect(result).toBeNull();
  });

  it("should NOT dispatch auth-required event when /status returns 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, ok: false }));

    const { checkCachedAudio } = await import("./synthesize");
    await checkCachedAudio("abc123def456abc123def456abc123def456abc123def456abc123def456abc123de");

    expect(authRequiredEvents).toHaveLength(0);
  });

  it("should return audioUrl when /status returns 200 with ready status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 200, ok: true,
      json: () => Promise.resolve({ status: "ready", cacheKey: "k", audioUrl: "http://audio.wav" }),
    }));

    const { checkCachedAudio } = await import("./synthesize");
    const result = await checkCachedAudio("abc123def456abc123def456abc123def456abc123def456abc123def456abc123de");

    expect(result).toBe("http://audio.wav");
  });

  it("should return null when /status returns 200 with processing status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 200, ok: true,
      json: () => Promise.resolve({ status: "processing", cacheKey: "k", audioUrl: null }),
    }));

    const { checkCachedAudio } = await import("./synthesize");
    const result = await checkCachedAudio("abc123def456abc123def456abc123def456abc123def456abc123def456abc123de");

    expect(result).toBeNull();
  });

  it("should return null on network error (not throw)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network error")));

    const { checkCachedAudio } = await import("./synthesize");
    const result = await checkCachedAudio("abc123def456abc123def456abc123def456abc123def456abc123def456abc123de");

    expect(result).toBeNull();
  });
});
