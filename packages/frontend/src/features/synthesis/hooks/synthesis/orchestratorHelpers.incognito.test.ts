// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));
vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

const mockCheckCachedAudio = vi.fn();
vi.mock("@/features/synthesis/utils/synthesize", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/synthesis/utils/synthesize")>();
  return { ...actual, checkCachedAudio: (...args: unknown[]) => mockCheckCachedAudio(...args) };
});

describe("orchestratorHelpers incognito scenario", () => {
  let mockSentenceState: {
    sentences: { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null; cacheKey?: string | null }[];
    updateSentence: Mock; getSentence: Mock;
  };
  let mockAudioPlayer: { currentAudio: HTMLAudioElement | null; stopCurrentAudio: Mock; playAudio: Mock; playWithAbort: Mock };
  let mockSynthesisAPI: { synthesizeText: Mock; synthesizeWithCache: Mock; analyzeText: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSentenceState = {
      sentences: [{ id: "s1", text: "läks", tags: ["läks"], audioUrl: null, phoneticText: null, cacheKey: null }],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id: string) => mockSentenceState.sentences.find((s) => s.id === id)),
    };
    mockAudioPlayer = { currentAudio: null, stopCurrentAudio: vi.fn(), playAudio: vi.fn().mockResolvedValue(true), playWithAbort: vi.fn().mockResolvedValue(true) };
    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({ audioUrl: "http://synth.mp3", phoneticText: "läks", stressedTags: ["läks"] }),
      synthesizeWithCache: vi.fn().mockResolvedValue({ audioUrl: "http://synth.mp3", phoneticText: "läks" }),
      analyzeText: vi.fn().mockResolvedValue({ stressedText: "läks" }),
    };
    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");
    (useSentenceState as Mock).mockReturnValue(mockSentenceState);
    (useAudioPlayer as Mock).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as Mock).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => vi.restoreAllMocks());

  it("synthesizeAndPlay should check backend cache before requiring auth (incognito: no cacheKey in state)", async () => {
    // Simulate incognito: sentence has text but NO cacheKey, audioUrl, or phoneticText
    mockCheckCachedAudio.mockResolvedValueOnce("http://cached-audio.wav");

    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });

    // checkCachedAudio should have been called with a computed cacheKey
    expect(mockCheckCachedAudio).toHaveBeenCalled();
    const calledKey = mockCheckCachedAudio.mock.calls[0]?.[0];
    expect(calledKey).toMatch(/^[a-f0-9]{64}$/);

    // Should play the cached audio WITHOUT calling synthesizeText (which requires auth)
    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
    expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith("http://cached-audio.wav", expect.any(Object));
  });

  it("synthesizeAndPlay should fall through to synthesis when backend cache misses", async () => {
    // Backend cache returns null (not cached)
    mockCheckCachedAudio.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });

    // Should have tried cache first
    expect(mockCheckCachedAudio).toHaveBeenCalled();
    // Then fell through to full synthesis
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalled();
  });
});
