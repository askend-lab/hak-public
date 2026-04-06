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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("filters out whitespace-only sentences", async () => {
    const mixed = [
      makeSentence("1", "  "),
      makeSentence("2", ""),
      makeSentence("3", "valid"),
    ];
    const { result } = renderHook(() =>
      usePlaylistControl({ sentences: mixed, playSingle: mockPlaySingle, stopAudio: mockStopAudio, updateAllSentences: mockUpdateAll }),
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
      usePlaylistControl({ sentences, playSingle: slowPlay, stopAudio: mockStopAudio, updateAllSentences: mockUpdateAll }),
    );
    act(() => { void result.current.handlePlayAll(); });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(mockStopAudio).toHaveBeenCalledTimes(1);
  });

  });

  });

  });

  });

  });

});
