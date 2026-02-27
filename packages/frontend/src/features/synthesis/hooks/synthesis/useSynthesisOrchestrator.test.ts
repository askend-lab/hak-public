// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

interface AudioHandlers {
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onEnded?: () => void;
  onError?: (err?: unknown) => void;
}

interface MockSentence {
  id: string;
  text: string;
  tags: string[];
  audioUrl?: string | null;
  phoneticText?: string | null;
  stressedTags?: string[];
  isLoading?: boolean;
  isPlaying?: boolean;
}

interface MockSentenceState {
  sentences: MockSentence[];
  updateSentence: Mock;
  getSentence: Mock;
  addSentence: Mock;
  deleteSentence: Mock;
}

interface MockAudioPlayer {
  currentAudio: HTMLAudioElement | null;
  stopCurrentAudio: Mock;
  playAudio: Mock;
  playWithAbort: Mock;
}

interface MockSynthesisAPI {
  synthesizeText: Mock;
  synthesizeWithCache: Mock;
}

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
        mockSentenceState.sentences.find((s: MockSentence) => s.id === id),
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
        .spyOn(logger, "error")
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
        .spyOn(logger, "error")
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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
        .spyOn(logger, "error")
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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
        async (_url: string, handlers: AudioHandlers) => {
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

// --- Merged from useSynthesisOrchestrator.mutations.test.ts ---
interface AudioHandlers { onLoadStart?: () => void; onLoadComplete?: () => void; onEnded?: () => void; onError?: (err?: unknown) => void; onStart?: () => void; }

vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("useSynthesisOrchestrator mutation kills", () => {
  let mockSentenceState: {
    sentences: { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null }[];
    updateSentence: Mock;
    getSentence: Mock;
  };
  let mockAudioPlayer: {
    currentAudio: HTMLAudioElement | null;
    stopCurrentAudio: Mock;
    playAudio: Mock;
    playWithAbort: Mock;
  };
  let mockSynthesisAPI: {
    synthesizeText: Mock;
    synthesizeWithCache: Mock;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSentenceState = {
      sentences: [{ id: "s1", text: "Hello world", tags: ["Hello", "world"], audioUrl: null, phoneticText: null }],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id: string) => mockSentenceState.sentences.find((s) => s.id === id)),
    };

    mockAudioPlayer = {
      currentAudio: null,
      stopCurrentAudio: vi.fn(),
      playAudio: vi.fn().mockResolvedValue(true),
      playWithAbort: vi.fn().mockResolvedValue(true),
    };

    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({
        audioUrl: "http://audio.mp3",
        phoneticText: "Héllo wórld",
        stressedTags: ["Héllo", "wórld"],
      }),
      synthesizeWithCache: vi.fn().mockResolvedValue({
        audioUrl: "http://audio.mp3",
        phoneticText: "Héllo wórld",
      }),
    };

    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");

    (useSentenceState as Mock).mockReturnValue(mockSentenceState);
    (useAudioPlayer as Mock).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as Mock).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => vi.restoreAllMocks());

  // --- playSingleSentence L40: empty text returns false ---
  it("playSingleSentence returns false for undefined sentence", async () => {
    mockSentenceState.getSentence.mockReturnValue(undefined);
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("missing"));
    expect(res).toBe(false);
  });

  // --- playSingleSentence L46,53: aborted before/after synthesis ---
  it("playSingleSentence returns false if aborted before synthesis starts", async () => {
    const ac = new AbortController();
    ac.abort();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1", ac.signal));
    expect(res).toBe(false);
    expect(mockSynthesisAPI.synthesizeWithCache).not.toHaveBeenCalled();
  });

  it("playSingleSentence returns false if aborted after synthesis", async () => {
    const ac = new AbortController();
    mockSynthesisAPI.synthesizeWithCache.mockImplementation(async () => {
      ac.abort();
      return { audioUrl: "http://a.mp3", phoneticText: "p" };
    });
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1", ac.signal));
    expect(res).toBe(false);
  });

  // --- playSingleSentence L54: updates audioUrl after synthesis ---
  it("playSingleSentence updates sentence with synthesized audioUrl", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, phoneticText: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { audioUrl: "http://audio.mp3" });
  });

  // --- playSingleSentence L56: synthesis error returns false ---
  it("playSingleSentence returns false on synthesis error", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(new Error("fail"));
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1"));
    expect(res).toBe(false);
    spy.mockRestore();
  });

  // --- playSingleSentence L61: aborted after audioUrl obtained ---
  it("playSingleSentence returns false when aborted after audioUrl set", async () => {
    const ac = new AbortController();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://cached.mp3", tags: [] });
    ac.abort();
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1", ac.signal));
    expect(res).toBe(false);
  });

  // --- playSingleSentence L64-66: playWithAbort callbacks ---
  it("playSingleSentence with abortSignal calls playWithAbort with callbacks", async () => {
    const ac = new AbortController();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://a.mp3", tags: [] });
    mockAudioPlayer.playWithAbort.mockImplementation(async (_u: string, _s: AbortSignal, cb: AudioHandlers) => {
      cb.onStart?.();
      cb.onEnded?.();
      return true;
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1", ac.signal); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: true });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
  });

  // --- playSingleSentence L67-77: onError with retry logic ---
  it("playSingleSentence onError clears audioUrl on first retry", async () => {
    vi.useFakeTimers();
    const ac = new AbortController();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://old.mp3", tags: [] });
    mockAudioPlayer.playWithAbort.mockImplementation(async (_u: string, _s: AbortSignal, cb: AudioHandlers) => {
      cb.onError?.();
      return false;
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1", ac.signal, 0); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { audioUrl: undefined, phoneticText: undefined });
    vi.useRealTimers();
  });

  // --- playSingleSentence L82-96: playAudio without abort ---
  it("playSingleSentence without abort calls playAudio with callbacks", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://a.mp3", tags: [] });
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => {
      cb.onLoadStart?.();
      cb.onEnded?.();
      return true;
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: true });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
  });

  it("playSingleSentence playAudio onError retries on first attempt", async () => {
    vi.useFakeTimers();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://old.mp3", tags: [] });
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => {
      cb.onError?.();
      return false;
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { audioUrl: undefined, phoneticText: undefined });
    vi.useRealTimers();
  });

  // --- synthesizeAndPlay L104-105: returns early for no text ---
  it("synthesizeAndPlay returns early for missing sentence", async () => {
    mockSentenceState.sentences = [];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("missing"); });
    expect(mockAudioPlayer.stopCurrentAudio).not.toHaveBeenCalled();
  });

  // --- synthesizeAndPlay L110: uses cached audio when both audioUrl and phoneticText exist ---
  it("synthesizeAndPlay plays cached audio without synthesizing", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
    expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith("http://c.mp3", expect.any(Object));
    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
  });

  // --- synthesizeAndPlay L133: sets isLoading when synthesizing ---
  it("synthesizeAndPlay sets isLoading true for new synthesis", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({ isLoading: true, isPlaying: false }));
  });

  // --- synthesizeAndPlay L138: passes phoneticText || undefined ---
  it("synthesizeAndPlay passes phoneticText when available", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"], phoneticText: "Hí" }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith("Hi", "Hí");
  });

  // --- synthesizeAndPlay L151-152: stressedTags length check ---
  it("synthesizeAndPlay includes stressedTags when length matches tags", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => {
      cb.onLoadComplete?.();
      return true;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({
      audioUrl: "http://a.mp3", phoneticText: "Héllo wórld", stressedTags: ["Héllo", "wórld"],
    });
    mockSentenceState.sentences = [{ id: "s1", text: "Hello world", tags: ["Hello", "world"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({ stressedTags: ["Héllo", "wórld"] }));
  });

  it("synthesizeAndPlay omits stressedTags when length doesn't match", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => {
      cb.onLoadComplete?.();
      return true;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({
      audioUrl: "http://a.mp3", phoneticText: "Héllo", stressedTags: ["Héllo"],
    });
    mockSentenceState.sentences = [{ id: "s1", text: "Hello world", tags: ["Hello", "world"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    const updates = mockSentenceState.updateSentence.mock.calls.find(
      (c: unknown[]) => (c[1] as Record<string, unknown>).isPlaying === true,
    );
    expect(updates).toBeTruthy();
    expect((updates?.[1] as Record<string, unknown>).stressedTags).toBeUndefined();
  });

  // --- synthesizeWithText L177-179: cache check ---
  it("synthesizeWithText uses cache when audioUrl, phoneticText match", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith("http://c.mp3", expect.any(Object));
    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
  });

  it("synthesizeWithText synthesizes when text differs", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Different"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith("Different", "Hí");
  });

  // --- synthesizeWithText L203: isLoading set ---
  it("synthesizeWithText sets isLoading true for new synthesis path", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "New", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "New"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: true, isPlaying: false });
  });

  it("synthesizeAndPlay cached onError clears audioUrl/phoneticText", async () => {
    vi.useFakeTimers();
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onError?.(); return false; });
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined });
    vi.useRealTimers();
  });

  it("synthesizeAndPlay catch on playAudio clears cache", async () => {
    mockAudioPlayer.playAudio.mockRejectedValueOnce(new Error("play failed"));
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { audioUrl: undefined, phoneticText: undefined });
  });

  it("synthesizeAndPlay new synthesis fires all callbacks correctly", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadComplete?.(); cb.onEnded?.(); return true; });
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({ isLoading: false, isPlaying: true }));
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
  });

  it("synthesizeAndPlay new synthesis onError sets loading/playing false", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onError?.(); return false; });
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: false });
  });

  it("synthesizeWithText cached path fires onLoadStart/onLoadComplete/onEnded", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadStart?.(); cb.onLoadComplete?.(); cb.onEnded?.(); return true; });
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: true });
  });

  it("synthesizeWithText cached onError clears cache", async () => {
    vi.useFakeTimers();
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onError?.(); return false; });
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined });
    vi.useRealTimers();
  });

  it("synthesizeWithText new synthesis fires all callbacks", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadComplete?.(); cb.onEnded?.(); return true; });
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "New", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "New"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: true, phoneticText: "Héllo wórld", audioUrl: "http://audio.mp3" });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: false });
  });

  it("synthesizeWithText new synthesis onError resets state", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onError?.(); return false; });
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "New", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "New"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: false });
  });

  it("synthesizeWithText skips cache when phoneticText missing", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalled();
  });

  it("synthesizeWithText skips cache when audioUrl missing", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", audioUrl: null, phoneticText: "Hí", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalled();
  });

  it("playSingleSentence logs error with correct prefix", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const err = new Error("fail");
    mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(err);
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(spy).toHaveBeenCalledWith("Failed to synthesize audio:", err);
    spy.mockRestore();
  });

  it("synthesizeAndPlay logs error with correct prefix", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const err = new Error("fail");
    mockSynthesisAPI.synthesizeText.mockRejectedValue(err);
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(spy).toHaveBeenCalledWith("Failed to synthesize:", err);
    spy.mockRestore();
  });

  it("playSingleSentence playAudio fires onLoadStart", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://a.mp3", tags: [] });
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadStart?.(); cb.onEnded?.(); return true; });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isPlaying: true });
  });
});
