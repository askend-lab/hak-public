// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaylistControl } from "./usePlaylistControl";
import { SentenceState } from "@/types/synthesis";

const makeSentence = (id: string, text: string): SentenceState => ({
  id, text, tags: text.split(" "), isPlaying: false, isLoading: false,
  currentInput: "", phoneticText: null, audioUrl: null, stressedTags: null,
});

describe("usePlaylistControl mutation kills", () => {
  const mockPlaySingle = vi.fn().mockResolvedValue(true);
  const mockStopAudio = vi.fn();
  const mockUpdateAll = vi.fn();
  let sentences: SentenceState[];

  beforeEach(() => {
    vi.clearAllMocks();
    sentences = [makeSentence("1", "hello"), makeSentence("2", "world")];
  });

  // L24: abort is called on playAllAbortController
  it("abort is called when stopping playback", async () => {
    const slowPlay = vi.fn().mockImplementation(
      () => new Promise<boolean>((r) => setTimeout(() => r(true), 100)),
    );
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, slowPlay, mockStopAudio, mockUpdateAll),
    );

    act(() => { result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(true);

    await act(async () => { await result.current.handlePlayAll(); });

    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
    expect(mockStopAudio).toHaveBeenCalled();
    expect(mockUpdateAll).toHaveBeenCalledWith({ isPlaying: false, isLoading: false });
  });

  // L27: isLoadingPlayAll set to false on stop
  it("sets isLoadingPlayAll to false when toggling off", async () => {
    const slowPlay = vi.fn().mockImplementation(
      () => new Promise<boolean>((r) => setTimeout(() => r(true), 100)),
    );
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, slowPlay, mockStopAudio, mockUpdateAll),
    );

    act(() => { result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(true);

    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  // L34: empty text sentences filtered
  it("does nothing when all sentences have empty text", async () => {
    const empty = [makeSentence("1", ""), makeSentence("2", "   ")];
    const { result } = renderHook(() =>
      usePlaylistControl(empty, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => { await result.current.handlePlayAll(); });
    expect(mockPlaySingle).not.toHaveBeenCalled();
  });

  // L40: isFirstSentence starts as true
  it("sets isLoadingPlayAll true at start", () => {
    const neverResolve = vi.fn().mockReturnValue(new Promise<boolean>(() => {}));
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, neverResolve, mockStopAudio, mockUpdateAll),
    );
    act(() => { result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(true);
    expect(result.current.isPlayingAll).toBe(false);
  });

  // L42-52: abortController.signal.aborted check breaks loop
  it("breaks loop when abort signal fires during playback", async () => {
    let callCount = 0;
    const abortingPlay = vi.fn().mockImplementation((_id: string, signal: AbortSignal) => {
      callCount++;
      if (callCount === 1) {
        // Simulate external abort after first call succeeds
        setTimeout(() => (signal as { aborted: boolean }).aborted = true, 0);
        return Promise.resolve(true);
      }
      return Promise.resolve(true);
    });
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, abortingPlay, mockStopAudio, mockUpdateAll),
    );
    await act(async () => { await result.current.handlePlayAll(); });
    // After abort, playback should end
    expect(result.current.isPlayingAll).toBe(false);
  });

  // L46-49: isFirstSentence && success → transition from loading to playing
  it("transitions from loading to playing after first successful play", async () => {
    let resolveFirst: ((v: boolean) => void) | null = null;
    const controlledPlay = vi.fn().mockImplementation(() => {
      if (!resolveFirst) {
        return new Promise<boolean>((r) => { resolveFirst = r; });
      }
      return Promise.resolve(true);
    });

    const { result } = renderHook(() =>
      usePlaylistControl(sentences, controlledPlay, mockStopAudio, mockUpdateAll),
    );

    act(() => { result.current.handlePlayAll(); });
    expect(result.current.isLoadingPlayAll).toBe(true);
    expect(result.current.isPlayingAll).toBe(false);

    // Resolve first sentence
    await act(async () => { resolveFirst?.(true); });

    // After completion, both should be false
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  // First sentence fails → no transition
  it("does not transition to playing when first play fails", async () => {
    mockPlaySingle.mockResolvedValueOnce(false);
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.isPlayingAll).toBe(false);
    expect(mockPlaySingle).toHaveBeenCalledTimes(1);
  });

  // L55-57: final cleanup after loop
  it("resets all state after full playback", async () => {
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });
});
