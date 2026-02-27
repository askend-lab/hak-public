// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

interface MockSentence { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null; stressedTags?: string[]; isLoading?: boolean; isPlaying?: boolean; }
interface MockSentenceState { sentences: MockSentence[]; updateSentence: Mock; getSentence: Mock; addSentence: Mock; deleteSentence: Mock; }
interface MockAudioPlayer { currentAudio: HTMLAudioElement | null; stopCurrentAudio: Mock; playAudio: Mock; playWithAbort: Mock; }
interface MockSynthesisAPI { synthesizeText: Mock; synthesizeWithCache: Mock; }

vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("useSynthesisOrchestrator - synthesizeAndPlay", () => {
  let mockSentenceState: MockSentenceState;
  let mockAudioPlayer: MockAudioPlayer;
  let mockSynthesisAPI: MockSynthesisAPI;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSentenceState = {
      sentences: [{ id: "test-1", text: "Hello world", tags: [], audioUrl: null, phoneticText: null }],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id) => mockSentenceState.sentences.find((s: MockSentence) => s.id === id)),
      addSentence: vi.fn(), deleteSentence: vi.fn(),
    };
    mockAudioPlayer = { currentAudio: null, stopCurrentAudio: vi.fn(), playAudio: vi.fn().mockResolvedValue(true), playWithAbort: vi.fn().mockResolvedValue(true) };
    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({ audioUrl: "https://example.com/audio.mp3", phoneticText: "ˈhɛloʊ wɝld", stressedTags: [] }),
      synthesizeWithCache: vi.fn().mockResolvedValue({ audioUrl: "https://example.com/audio.mp3", phoneticText: "ˈhɛloʊ wɝld" }),
    };
    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");
    (useSentenceState as ReturnType<typeof vi.fn>).mockReturnValue(mockSentenceState);
    (useAudioPlayer as ReturnType<typeof vi.fn>).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as ReturnType<typeof vi.fn>).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => { vi.restoreAllMocks(); });

  it("should return early if no text", async () => {
    mockSentenceState.sentences = [{ id: "test-1", text: "  ", tags: [] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());

    await act(async () => {
      await result.current.synthesizeAndPlay("test-1");
    });

    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
  });

  it("should play cached audio if available", async () => {
    mockSentenceState.sentences = [
      { id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "test", tags: [] },
    ];

    const { result } = renderHook(() => useSynthesisOrchestrator());

    await act(async () => {
      await result.current.synthesizeAndPlay("test-1");
    });

    expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
    expect(mockAudioPlayer.playAudio).toHaveBeenCalled();
  });

  it("should synthesize new audio if not cached", async () => {
    mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: [] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());

    await act(async () => {
      await result.current.synthesizeAndPlay("test-1");
    });

    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith("Hello", undefined);
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
      tags: expect.any(Array), isLoading: true, isPlaying: false,
    });
  });

  it("should handle synthesis error", async () => {
    mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error("Failed"));
    mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: [] }];

    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSynthesisOrchestrator());

    await act(async () => {
      await result.current.synthesizeAndPlay("test-1");
    });

    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
      isLoading: false, isPlaying: false,
    });
    consoleSpy.mockRestore();
  });
});
