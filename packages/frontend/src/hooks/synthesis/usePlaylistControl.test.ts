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
});
