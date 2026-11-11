// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSynthesisOrchestrator } from "./useSynthesisOrchestrator";
import type { Mock } from "vitest";

interface AudioHandlers { onLoadStart?: () => void; onLoadComplete?: () => void; onEnded?: () => void; onError?: (err?: unknown) => void; }
interface MockSentence { id: string; text: string; tags: string[]; audioUrl?: string | null; phoneticText?: string | null; stressedTags?: string[]; isLoading?: boolean; isPlaying?: boolean; }
interface MockSentenceState { sentences: MockSentence[]; updateSentence: Mock; getSentence: Mock; addSentence: Mock; deleteSentence: Mock; }
interface MockAudioPlayer { currentAudio: HTMLAudioElement | null; stopCurrentAudio: Mock; playAudio: Mock; playWithAbort: Mock; }
interface MockSynthesisAPI { synthesizeText: Mock; synthesizeWithCache: Mock; }

vi.mock("./useSentenceState");
vi.mock("./useAudioPlayer");
vi.mock("./useSynthesisAPI");

describe("useSynthesisOrchestrator - callbacks", () => {
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

  it("should invoke synthesizeWithText onLoadComplete and onEnded for new synthesis", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onLoadComplete?.(); handlers?.onEnded?.(); return true;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({ audioUrl: "https://example.com/new.mp3", phoneticText: "new-phonetic" });
    mockSentenceState.getSentence.mockReturnValue({ id: "test-1", text: "New text", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "New text"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", expect.objectContaining({
      isLoading: false, isPlaying: true, phoneticText: "new-phonetic", audioUrl: "https://example.com/new.mp3",
    }));
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isPlaying: false });
  });

  it("should invoke synthesizeWithText onError for new synthesis", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onError?.(); return false;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({ audioUrl: "https://example.com/new.mp3", phoneticText: "new-phonetic" });
    mockSentenceState.getSentence.mockReturnValue({ id: "test-1", text: "New text", tags: [] });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "New text"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isLoading: false, isPlaying: false });
  });

  it("should invoke synthesizeAndPlay cached onLoadComplete callback", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onLoadComplete?.(); return true;
    });
    mockSentenceState.sentences = [
      { id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached", tags: ["Hello"] },
    ];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("test-1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isLoading: false, isPlaying: true });
  });

  it("should invoke synthesizeAndPlay cached onError with retry", async () => {
    vi.useFakeTimers();
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onError?.(); return false;
    });
    mockSentenceState.sentences = [
      { id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached", tags: ["Hello"] },
    ];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("test-1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
      isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined,
    });
    vi.useRealTimers();
  });

  it("should handle synthesizeAndPlay cached playAudio rejection", async () => {
    mockAudioPlayer.playAudio.mockRejectedValueOnce(new Error("play failed"));
    mockSentenceState.sentences = [
      { id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached", tags: ["Hello"] },
    ];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("test-1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { audioUrl: undefined, phoneticText: undefined });
  });

  it("should invoke synthesizeAndPlay onEnded callback", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onEnded?.(); return true;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({ audioUrl: "https://example.com/new.mp3", phoneticText: "phonetic", stressedTags: [] });
    mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: [] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("test-1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isPlaying: false });
  });

  it("should invoke onError in cached path and retry via setTimeout", async () => {
    vi.useFakeTimers();
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onError?.(); return false;
    });
    mockSentenceState.getSentence.mockReturnValue({
      id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached-phonetic", tags: ["Hello"],
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Hello"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
      isLoading: false, isPlaying: false, audioUrl: undefined, phoneticText: undefined,
    });
    vi.useRealTimers();
  });
});
