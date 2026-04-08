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

describe("useSynthesisOrchestrator mutation kills - part 2", () => {
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
