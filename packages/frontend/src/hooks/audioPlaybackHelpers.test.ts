// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AudioAction } from "./useAudioPlaybackState";
import { TaskEntry } from "@/types/task";

const mockSynthesizeWithPolling = vi.fn();
const mockCheckCachedAudio = vi.fn();
const mockComputeCacheKey = vi.fn();

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: (...args: unknown[]) => mockSynthesizeWithPolling(...args),
  checkCachedAudio: (...args: unknown[]) => mockCheckCachedAudio(...args),
  computeCacheKey: (...args: unknown[]) => mockComputeCacheKey(...args),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: (text: string): string =>
    text.split(/\s+/).length > 1 ? "efm_l" : "efm_s",
}));

function createEntry(id: string, text = "tere", stressedText?: string): TaskEntry {
  return {
    id,
    taskId: "t1",
    text,
    stressedText: stressedText ?? text,
    audioUrl: null,
    audioBlob: null,
    order: 0,
    createdAt: new Date(),
  };
}

function createDispatch(): React.Dispatch<AudioAction> {
  return vi.fn();
}

describe("doSynthesize — S3 cache check (via synthesizeAndCreateAudio)", () => {
  let synthesizeAndCreateAudio: typeof import("./audioPlaybackHelpers").synthesizeAndCreateAudio;

  beforeEach(async () => {
    vi.clearAllMocks();

    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(function (this: MockAudio) {
        setTimeout(() => this.onloadeddata?.(), 0);
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.revokeObjectURL = vi.fn();

    mockComputeCacheKey.mockResolvedValue("abc123hash");
    mockCheckCachedAudio.mockResolvedValue(null);
    mockSynthesizeWithPolling.mockResolvedValue({ audioUrl: "http://synth.mp3", cacheKey: "key1" });

    const mod = await import("./audioPlaybackHelpers");
    synthesizeAndCreateAudio = mod.synthesizeAndCreateAudio;
  });

  it("checks S3 cache via computeCacheKey + checkCachedAudio before calling synthesizeWithPolling", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");

    mockCheckCachedAudio.mockResolvedValue(null);

    synthesizeAndCreateAudio({ entry, id: "e1", playResult: null, logPrefix: "Test", dispatch });

    // Allow async operations to complete
    await vi.waitFor(() => {
      expect(mockComputeCacheKey).toHaveBeenCalledWith("tere", "efm_s");
      expect(mockCheckCachedAudio).toHaveBeenCalledWith("abc123hash");
    });
  });

  it("plays from S3 cache without calling synthesizeWithPolling", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");

    mockCheckCachedAudio.mockResolvedValue("http://cached-audio.wav");

    synthesizeAndCreateAudio({ entry, id: "e1", playResult: null, logPrefix: "Test", dispatch });

    await vi.waitFor(() => {
      expect(mockCheckCachedAudio).toHaveBeenCalled();
    });

    // Should NOT call synthesizeWithPolling since cache hit
    expect(mockSynthesizeWithPolling).not.toHaveBeenCalled();
  });

  it("falls back to synthesizeWithPolling when S3 cache misses", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");

    mockCheckCachedAudio.mockResolvedValue(null);

    synthesizeAndCreateAudio({ entry, id: "e1", playResult: null, logPrefix: "Test", dispatch });

    await vi.waitFor(() => {
      expect(mockComputeCacheKey).toHaveBeenCalled();
      expect(mockCheckCachedAudio).toHaveBeenCalled();
      expect(mockSynthesizeWithPolling).toHaveBeenCalledWith("tere", "efm_s");
    });
  });
});

describe("fetchAudioUrl — S3 cache check (via resolveEntryAudioUrl)", () => {
  let resolveEntryAudioUrl: typeof import("./audioPlaybackHelpers").resolveEntryAudioUrl;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockComputeCacheKey.mockResolvedValue("abc123hash");
    mockCheckCachedAudio.mockResolvedValue(null);
    mockSynthesizeWithPolling.mockResolvedValue({ audioUrl: "http://synth.mp3", cacheKey: "key1" });

    const mod = await import("./audioPlaybackHelpers");
    resolveEntryAudioUrl = mod.resolveEntryAudioUrl;
  });

  it("checks S3 cache via computeCacheKey + checkCachedAudio before calling synthesizeWithPolling", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");
    const controller = new AbortController();

    await resolveEntryAudioUrl(entry, controller.signal, dispatch);

    expect(mockComputeCacheKey).toHaveBeenCalledWith("tere", "efm_s");
    expect(mockCheckCachedAudio).toHaveBeenCalledWith("abc123hash");
  });

  it("returns cached URL without calling synthesizeWithPolling", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");
    const controller = new AbortController();

    mockCheckCachedAudio.mockResolvedValue("http://cached-audio.wav");

    const result = await resolveEntryAudioUrl(entry, controller.signal, dispatch);

    expect(mockCheckCachedAudio).toHaveBeenCalled();
    expect(mockSynthesizeWithPolling).not.toHaveBeenCalled();
    expect(result).toEqual({ url: "http://cached-audio.wav", shouldRevoke: false });
  });

  it("falls back to synthesizeWithPolling when S3 cache misses", async () => {
    const dispatch = createDispatch();
    const entry = createEntry("e1", "tere");
    const controller = new AbortController();

    mockCheckCachedAudio.mockResolvedValue(null);

    const result = await resolveEntryAudioUrl(entry, controller.signal, dispatch);

    expect(mockComputeCacheKey).toHaveBeenCalled();
    expect(mockCheckCachedAudio).toHaveBeenCalled();
    expect(mockSynthesizeWithPolling).toHaveBeenCalledWith("tere", "efm_s");
    expect(result).toEqual({ url: "http://synth.mp3", shouldRevoke: false });
  });
});
