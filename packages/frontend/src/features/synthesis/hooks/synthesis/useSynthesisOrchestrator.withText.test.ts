// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@hak/shared";
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

describe("useSynthesisOrchestrator - synthesizeWithText", () => {
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

  it("should play cached audio if text matches", async () => {
    mockSentenceState.getSentence.mockReturnValue({
      id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "test", tags: [],
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Hello"); });
    expect(mockAudioPlayer.stopCurrentAudio).toHaveBeenCalled();
    expect(mockAudioPlayer.playAudio).toHaveBeenCalled();
    expect(mockSynthesisAPI.synthesizeText).not.toHaveBeenCalled();
  });

  it("should synthesize new audio if text differs", async () => {
    mockSentenceState.getSentence.mockReturnValue({
      id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "test", tags: [],
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Goodbye"); });
    expect(mockSynthesisAPI.synthesizeText).toHaveBeenCalledWith("Goodbye", "test");
  });

  it("should handle synthesis error", async () => {
    mockSynthesisAPI.synthesizeText.mockRejectedValue(new Error("Failed"));
    mockSentenceState.getSentence.mockReturnValue({ id: "test-1", text: "Hello", audioUrl: null, tags: [] });
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Goodbye"); });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("should invoke synthesizeAndPlay onLoadComplete with stressedTags", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onLoadComplete?.();
      return true;
    });
    mockSynthesisAPI.synthesizeText.mockResolvedValue({
      audioUrl: "https://example.com/new.mp3", phoneticText: "new-phonetic", stressedTags: ["Hello"],
    });
    mockSentenceState.sentences = [{ id: "test-1", text: "Hello", tags: ["Hello"] }];
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeAndPlay("test-1"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", expect.objectContaining({
      isLoading: false, isPlaying: true, stressedTags: ["Hello"],
    }));
  });

  it("should invoke cached path callbacks in synthesizeWithText when text matches", async () => {
    mockAudioPlayer.playAudio.mockImplementation(async (_url: string, handlers: AudioHandlers) => {
      handlers?.onLoadStart?.();
      handlers?.onLoadComplete?.();
      handlers?.onEnded?.();
      return true;
    });
    mockSentenceState.getSentence.mockReturnValue({
      id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached-phonetic", tags: ["Hello"],
    });
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Hello"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isLoading: false, isPlaying: true });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", { isPlaying: false });
  });

  it("should handle cached path playAudio rejection", async () => {
    mockAudioPlayer.playAudio.mockRejectedValueOnce(new Error("play failed"));
    mockSentenceState.getSentence.mockReturnValue({
      id: "test-1", text: "Hello", audioUrl: "https://example.com/cached.mp3", phoneticText: "cached-phonetic", tags: ["Hello"],
    });
    const consoleSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useSynthesisOrchestrator());
    await act(async () => { await result.current.synthesizeWithText("test-1", "Hello"); });
    expect(mockSentenceState.updateSentence).toHaveBeenCalledWith("test-1", {
      audioUrl: undefined, phoneticText: undefined,
    });
    consoleSpy.mockRestore();
  });
});
