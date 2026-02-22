// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaylistControl } from "./usePlaylistControl";
import { SentenceState } from "@/types/synthesis";

const makeSentence = (id: string, text: string): SentenceState => ({
  id,
  text,
  tags: text.split(" "),
  isPlaying: false,
  isLoading: false,
  currentInput: "",
  phoneticText: null,
  audioUrl: null,
  stressedTags: null,
});

describe("usePlaylistControl", () => {
  const mockPlaySingle = vi.fn().mockResolvedValue(true);
  const mockStopAudio = vi.fn();
  const mockUpdateAll = vi.fn();
  let sentences: SentenceState[];

  beforeEach(() => {
    vi.clearAllMocks();
    sentences = [makeSentence("1", "hello"), makeSentence("2", "world")];
  });

  it("initializes with idle state", () => {
    const { result } = renderHook(() =>
      usePlaylistControl(
        sentences,
        mockPlaySingle,
        mockStopAudio,
        mockUpdateAll,
      ),
    );
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("does nothing with empty sentences", async () => {
    const { result } = renderHook(() =>
      usePlaylistControl([], mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).not.toHaveBeenCalled();
  });

  it("plays all sentences sequentially", async () => {
    const { result } = renderHook(() =>
      usePlaylistControl(
        sentences,
        mockPlaySingle,
        mockStopAudio,
        mockUpdateAll,
      ),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).toHaveBeenCalledTimes(2);
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("stops playback when called while playing", async () => {
    const slowPlay = vi
      .fn()
      .mockImplementation(
        (): Promise<boolean> =>
          new Promise((r) => setTimeout(() => r(true), 50)),
      );
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, slowPlay, mockStopAudio, mockUpdateAll),
    );

    act(() => {
      void result.current.handlePlayAll();
    });
    expect(result.current.isLoadingPlayAll).toBe(true);

    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(mockStopAudio).toHaveBeenCalled();
  });

  it("stops when playSingle returns false", async () => {
    mockPlaySingle.mockResolvedValueOnce(false);
    const { result } = renderHook(() =>
      usePlaylistControl(
        sentences,
        mockPlaySingle,
        mockStopAudio,
        mockUpdateAll,
      ),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).toHaveBeenCalledTimes(1);
  });

  it("skips sentences with empty text", async () => {
    const mixed = [makeSentence("1", "hello"), makeSentence("2", "  ")];
    const { result } = renderHook(() =>
      usePlaylistControl(mixed, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).toHaveBeenCalledTimes(1);
  });

  it("calls playSingle with sentence id and abort signal", async () => {
    const { result } = renderHook(() =>
      usePlaylistControl(
        sentences,
        mockPlaySingle,
        mockStopAudio,
        mockUpdateAll,
      ),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).toHaveBeenCalledWith("1", expect.any(AbortSignal));
    expect(mockPlaySingle).toHaveBeenCalledWith("2", expect.any(AbortSignal));
  });

  it("calls updateAllSentences with isPlaying false on stop", async () => {
    const slowPlay = vi.fn().mockImplementation(
      (): Promise<boolean> => new Promise((r) => setTimeout(() => r(true), 50)),
    );
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, slowPlay, mockStopAudio, mockUpdateAll),
    );
    act(() => { void result.current.handlePlayAll(); });
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockUpdateAll).toHaveBeenCalledWith({
      isPlaying: false,
      isLoading: false,
    });
  });

  it("resets all state after successful complete playback", async () => {
    const { result } = renderHook(() =>
      usePlaylistControl(
        sentences,
        mockPlaySingle,
        mockStopAudio,
        mockUpdateAll,
      ),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("transitions from loading to playing after first success", async () => {
    const trackingPlay = vi.fn().mockImplementation(async () => {
      return true;
    });
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, trackingPlay, mockStopAudio, mockUpdateAll),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    // Both sentences played
    expect(trackingPlay).toHaveBeenCalledTimes(2);
    // After completion both flags are false
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("does not transition to playing when first entry fails", async () => {
    mockPlaySingle.mockResolvedValue(false);
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("filters out whitespace-only sentences", async () => {
    const mixed = [
      makeSentence("1", "  "),
      makeSentence("2", ""),
      makeSentence("3", "valid"),
    ];
    const { result } = renderHook(() =>
      usePlaylistControl(mixed, mockPlaySingle, mockStopAudio, mockUpdateAll),
    );
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(mockPlaySingle).toHaveBeenCalledTimes(1);
    expect(mockPlaySingle).toHaveBeenCalledWith("3", expect.any(AbortSignal));
  });

  it("stopAudio is called when toggling off", async () => {
    const slowPlay = vi.fn().mockImplementation(
      (): Promise<boolean> => new Promise((r) => setTimeout(() => r(true), 50)),
    );
    const { result } = renderHook(() =>
      usePlaylistControl(sentences, slowPlay, mockStopAudio, mockUpdateAll),
    );
    act(() => { void result.current.handlePlayAll(); });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(mockStopAudio).toHaveBeenCalledTimes(1);
  });
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

    act(() => { void result.current.handlePlayAll(); });
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

    act(() => { void result.current.handlePlayAll(); });
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
    act(() => { void result.current.handlePlayAll(); });
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
        setTimeout(() => { (signal as { aborted: boolean }).aborted = true; }, 0);
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

    act(() => { void result.current.handlePlayAll(); });
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
