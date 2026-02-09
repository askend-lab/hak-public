// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";

vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("useSynthesisOrchestrator", () => {
  let mockSentenceState: any;
  let mockAudioPlayer: any;
  let mockSynthesisAPI: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSentenceState = {
      sentences: [
        {
          id: "test-1",
          text: "Hello world",
          tags: [],
          audioUrl: null,
          phoneticText: null,
        },
      ],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id) =>
        mockSentenceState.sentences.find((s: any) => s.id === id),
      ),
      addSentence: vi.fn(),
      deleteSentence: vi.fn(),
    };

    mockAudioPlayer = {
      currentAudio: null,
      stopCurrentAudio: vi.fn(),
      playAudio: vi.fn().mockResolvedValue(true),
      playWithAbort: vi.fn().mockResolvedValue(true),
    };

    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({
        audioUrl: "https://example.com/audio.mp3",
        phoneticText: "ˈhɛloʊ wɝld",
        stressedTags: [],
      }),
      synthesizeWithCache: vi.fn().mockResolvedValue({
        audioUrl: "https://example.com/audio.mp3",
        phoneticText: "ˈhɛloʊ wɝld",
      }),
    };

    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");

    (useSentenceState as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSentenceState,
    );
    (useAudioPlayer as ReturnType<typeof vi.fn>).mockReturnValue(
      mockAudioPlayer,
    );
    (useSynthesisAPI as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSynthesisAPI,
    );
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
        null,
        null,
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
        .spyOn(console, "error")
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

  describe("synthesizeAndPlay", () => {
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
        {
          id: "test-1",
          text: "Hello",
          audioUrl: "https://example.com/cached.mp3",
          phoneticText: "test",
          tags: [],
        },
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

      expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith(
        "Hello",
        undefined,
      );
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        tags: expect.any(Array),
        isLoading: true,
        isPlaying: false,
      });
    });

    it("should handle synthesis error", async () => {
      mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error("Failed"));
      mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: [] }];

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: false,
      });
      consoleSpy.mockRestore();
    });
  });

  describe("synthesizeWithText", () => {
    it("should play cached audio if text matches", async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        phoneticText: "test",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "Hello");
      });

      expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
      expect(mockAudioPlayer.playAudio).toHaveBeenCalled();
      expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
    });

    it("should synthesize new audio if text differs", async () => {
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        phoneticText: "test",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "Goodbye");
      });

      expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith(
        "Goodbye",
        "test",
      );
    });

    it("should handle synthesis error", async () => {
      mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error("Failed"));
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        tags: [],
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "New text");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: false,
      });
      consoleSpy.mockRestore();
    });

    it("should invoke synthesizeAndPlay onLoadComplete with stressedTags", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onLoadComplete?.();
          handlers?.onEnded?.();
          return true;
        },
      );
      mockSynthesisAPI.synthesizeText.mockResolvedValue({
        audioUrl: "https://example.com/new.mp3",
        phoneticText: "phonetic",
        stressedTags: ["Héllo", "wórld"],
      });
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello world",
        tags: ["Hello", "world"],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith(
        "test-1",
        expect.objectContaining({
          stressedTags: ["Héllo", "wórld"],
        }),
      );
    });

    it("should invoke cached path callbacks in synthesizeWithText when text matches", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onLoadStart?.();
          handlers?.onLoadComplete?.();
          handlers?.onEnded?.();
          return true;
        },
      );
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        phoneticText: "cached-phonetic",
        tags: ["Hello"],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "Hello");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isPlaying: false,
      });
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: true,
      });
    });

    it("should handle cached path playAudio rejection", async () => {
      mockAudioPlayer.playAudio.mockRejectedValueOnce(new Error("play failed"));
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        phoneticText: "cached-phonetic",
        tags: ["Hello"],
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "Hello");
      });

      // After catch, audioUrl and phoneticText should be cleared, then synthesis should proceed
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        audioUrl: undefined,
        phoneticText: undefined,
      });
      consoleSpy.mockRestore();
    });

    it("should invoke synthesizeWithText onLoadComplete and onEnded for new synthesis", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onLoadComplete?.();
          handlers?.onEnded?.();
          return true;
        },
      );
      mockSynthesisAPI.synthesizeText.mockResolvedValue({
        audioUrl: "https://example.com/new.mp3",
        phoneticText: "new-phonetic",
      });
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "New text",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "New text");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith(
        "test-1",
        expect.objectContaining({
          isLoading: false,
          isPlaying: true,
          phoneticText: "new-phonetic",
          audioUrl: "https://example.com/new.mp3",
        }),
      );
      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isPlaying: false,
      });
    });

    it("should invoke synthesizeWithText onError for new synthesis", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onError?.();
          return false;
        },
      );
      mockSynthesisAPI.synthesizeText.mockResolvedValue({
        audioUrl: "https://example.com/new.mp3",
        phoneticText: "new-phonetic",
      });
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "New text",
        tags: [],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "New text");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: false,
      });
    });

    it("should invoke synthesizeAndPlay cached onLoadComplete callback", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onLoadComplete?.();
          return true;
        },
      );
      mockSentenceState.sentences = [
        {
          id: "test-1",
          text: "Hello",
          audioUrl: "https://example.com/cached.mp3",
          phoneticText: "cached",
          tags: ["Hello"],
        },
      ];

      const { result } = renderHook(() => useSynthesisOrchestrator());
      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: true,
      });
    });

    it("should invoke synthesizeAndPlay cached onError with retry", async () => {
      vi.useFakeTimers();
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onError?.();
          return false;
        },
      );
      mockSentenceState.sentences = [
        {
          id: "test-1",
          text: "Hello",
          audioUrl: "https://example.com/cached.mp3",
          phoneticText: "cached",
          tags: ["Hello"],
        },
      ];

      const { result } = renderHook(() => useSynthesisOrchestrator());
      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: false,
        audioUrl: undefined,
        phoneticText: undefined,
      });
      vi.useRealTimers();
    });

    it("should handle synthesizeAndPlay cached playAudio rejection", async () => {
      mockAudioPlayer.playAudio.mockRejectedValueOnce(new Error("play failed"));
      mockSentenceState.sentences = [
        {
          id: "test-1",
          text: "Hello",
          audioUrl: "https://example.com/cached.mp3",
          phoneticText: "cached",
          tags: ["Hello"],
        },
      ];

      const { result } = renderHook(() => useSynthesisOrchestrator());
      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        audioUrl: undefined,
        phoneticText: undefined,
      });
    });

    it("should invoke synthesizeAndPlay onEnded callback", async () => {
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onEnded?.();
          return true;
        },
      );
      mockSynthesisAPI.synthesizeText.mockResolvedValue({
        audioUrl: "https://example.com/new.mp3",
        phoneticText: "phonetic",
        stressedTags: [],
      });
      mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: [] }];

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeAndPlay("test-1");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isPlaying: false,
      });
    });

    it("should invoke onError in cached path and retry via setTimeout", async () => {
      vi.useFakeTimers();
      mockAudioPlayer.playAudio.mockImplementation(
        async (_url: string, handlers: any) => {
          handlers?.onError?.();
          return false;
        },
      );
      mockSentenceState.getSentence.mockReturnValue({
        id: "test-1",
        text: "Hello",
        audioUrl: "https://example.com/cached.mp3",
        phoneticText: "cached-phonetic",
        tags: ["Hello"],
      });

      const { result } = renderHook(() => useSynthesisOrchestrator());

      await act(async () => {
        await result.current.synthesizeWithText("test-1", "Hello");
      });

      expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
        isLoading: false,
        isPlaying: false,
        audioUrl: undefined,
        phoneticText: undefined,
      });
      vi.useRealTimers();
    });
  });
});
