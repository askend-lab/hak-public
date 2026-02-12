// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

interface AudioHandlers {
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onEnded?: () => void;
  onError?: (err?: unknown) => void;
  onStart?: () => void;
}

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
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
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

  // --- synthesizeWithText L225: error handling ---
  it("synthesizeWithText handles synthesis error gracefully", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error("fail"));
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "Hi", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("s1", "Hi"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", { isLoading: false, isPlaying: false });
    spy.mockRestore();
  });
});
