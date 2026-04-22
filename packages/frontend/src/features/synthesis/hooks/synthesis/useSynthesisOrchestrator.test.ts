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

describe("useSynthesisOrchestrator", () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("playSingleSentence", () => {
    it("should return false if sentence has no text", async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "  ",
        tags: [],
      });
      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence("test-1");
      });

      expect(success).toBe(false);
    });

    it("should play existing audio if available", async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence("test-1");
      });

      expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith(
        "https://example.com/cached.mp3",
        expect.any(Object),
      );
    });

    it("should synthesize audio if not cached", async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: null,
        phoneticText: null,
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence("test-1");
      });

      expect(mockSynthesisAPI.synthesizeWithCache).toHaveBeenCalledWith(
        "Hello",
        undefined,
      );
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        audioUrl: "https://example.com/audio.mp3",
      });
    });

    it("should return false if aborted before synthesis", async () => {
      const abortController = new AbortController();
      abortController.abort();

      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: null,
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence(
          "test-1",
          abortController.signal,
        );
      });

      expect(success).toBe(false);
    });

    it("should handle synthesis error", async () => {
      mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(
        new Error("Synthesis failed"),
      );
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: null,
        tags: [],
      });

      const consoleSpy = vi
        .spyOn(logger, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      const success = await act(async () => {
        return result.current.playSingleSentence("test-1");
      });

      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should use playWithAbort when abort signal provided", async () => {
      const abortController = new AbortController();
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.playSingleSentence(
          "test-1",
          abortController.signal,
        );
      });

      expect(mockAudioPlayer.playWithAbort).toHaveBeenCalledWith(
        "https://example.com/cached.mp3",
        abortController.signal,
        expect.any(Object),
      );
    });
  });
});
