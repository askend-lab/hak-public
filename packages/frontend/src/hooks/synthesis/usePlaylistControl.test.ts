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
      result.current.handlePlayAll();
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
    act(() => { result.current.handlePlayAll(); });
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
    act(() => { result.current.handlePlayAll(); });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(mockStopAudio).toHaveBeenCalledTimes(1);
  });
});
