// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

interface AudioHandlers { onLoadStart?: () => void; onLoadComplete?: () => void; onEnded?: () => void; onError?: (err?: unknown) => void; onStart?: () => void; }

vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("useSynthesisOrchestrator mutation kills - part 1", () => {
  let mockSentenceState: {
    sentences: { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null }[];
    updateSentence: Mock; getSentence: Mock;
  };
  let mockAudioPlayer: { currentAudio: HTMLAudioElement | null; stopCurrentAudio: Mock; playAudio: Mock; playWithAbort: Mock; };
  let mockSynthesisAPI: { synthesizeText: Mock; synthesizeWithCache: Mock; };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSentenceState = {
      sentences: [{ id: "s1", text: "Hello world", tags: ["Hello", "world"], audioUrl: null, phoneticText: null }],
      updateSentence: vi.fn(),
      getSentence: vi.fn((id: string) => mockSentenceState.sentences.find((s) => s.id === id)),
    };
    mockAudioPlayer = { currentAudio: null, stopCurrentAudio: vi.fn(), playAudio: vi.fn().mockResolvedValue(true), playWithAbort: vi.fn().mockResolvedValue(true) };
    mockSynthesisAPI = {
      synthesizeText: vi.fn().mockResolvedValue({ audioUrl: "http://audio.mp3", phoneticText: "Héllo wórld", stressedTags: ["Héllo", "wórld"] }),
      synthesizeWithCache: vi.fn().mockResolvedValue({ audioUrl: "http://audio.mp3", phoneticText: "Héllo wórld" }),
    };
    const { useSentenceState } = await import("./useSentenceState");
    const { useAudioPlayer } = await import("./useAudioPlayer");
    const { useSynthesisAPI } = await import("./useSynthesisAPI");
    (useSentenceState as Mock).mockReturnValue(mockSentenceState);
    (useAudioPlayer as Mock).mockReturnValue(mockAudioPlayer);
    (useSynthesisAPI as Mock).mockReturnValue(mockSynthesisAPI);
  });

  afterEach(() => vi.restoreAllMocks());

  it("playSingleSentence returns false for undefined sentence", async () => {
    mockSentenceState.getSentence.mockReturnValue(undefined);
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("missing"));
    expect(res).toBe(false);
  });

  it("playSingleSentence returns false for empty text", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1"));
    expect(res).toBe(false);
  });

  it("playSingleSentence returns false if aborted before play", async () => {
    const ac = new AbortController(); ac.abort();
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

  it("playSingleSentence returns false on synthesis error", async () => {
    const spy = vi.spyOn(logger, "error").mockImplementation(() => {});
    mockSynthesisAPI.synthesizeWithCache.mockRejectedValue(new Error("fail"));
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: null, tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    const res = await act(async () => result.current.playSingleSentence("s1"));
    expect(res).toBe(false);
    spy.mockRestore();
  });

  it("playSingleSentence uses playWithAbort when signal provided", async () => {
    const ac = new AbortController();
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://a.mp3", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1", ac.signal); });
    expect(mockAudioPlayer.playWithAbort).toHaveBeenCalledWith("http://a.mp3", ac.signal, expect.any(Object));
  });

  it("playSingleSentence uses playAudio without signal", async () => {
    mockSentenceState.getSentence.mockReturnValue({ id: "s1", text: "hi", audioUrl: "http://a.mp3", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.playSingleSentence("s1"); });
    expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith("http://a.mp3", expect.any(Object));
  });

  it("synthesizeAndPlay returns early for missing sentence", async () => {
    mockSentenceState.sentences = [];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("missing"); });
    expect(mockAudioPlayer.stopCurrentAudio).not.toHaveBeenCalled();
  });

  it("synthesizeAndPlay plays cached audio without synthesizing", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", audioUrl: "http://c.mp3", phoneticText: "Hí", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
    expect(mockAudioPlayer.playAudio).toHaveBeenCalledWith("http://c.mp3", expect.any(Object));
    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
  });

  it("synthesizeAndPlay sets isLoading true for new synthesis", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({ isLoading: true, isPlaying: false }));
  });

  it("synthesizeAndPlay passes phoneticText when available", async () => {
    mockSentenceState.sentences = [{ id: "s1", text: "Hi", tags: ["Hi"], phoneticText: "Hí" }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith("Hi", "Hí");
  });

  it("synthesizeAndPlay includes stressedTags when length matches tags", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadComplete?.(); return true; });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({ audioUrl: "http://a.mp3", phoneticText: "Héllo wórld", stressedTags: ["Héllo", "wórld"] });
    mockSentenceState.sentences = [{ id: "s1", text: "Hello world", tags: ["Hello", "world"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("s1", expect.objectContaining({ stressedTags: ["Héllo", "wórld"] }));
  });

  it("synthesizeAndPlay omits stressedTags when length doesn't match", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_u: string, cb: AudioHandlers) => { cb.onLoadComplete?.(); return true; });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({ audioUrl: "http://a.mp3", phoneticText: "Héllo", stressedTags: ["Héllo"] });
    mockSentenceState.sentences = [{ id: "s1", text: "Hello world", tags: ["Hello", "world"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("s1"); });
    const updates = mockSentenceState.updateSentence.mock.calls.find(
      (c: unknown[]) => (c[1] as Record<string, unknown>).isPlaying === true,
    );
    expect(updates).toBeTruthy();
    expect((updates?.[1] as Record<string, unknown>).stressedTags).toBeUndefined();
  });
});
