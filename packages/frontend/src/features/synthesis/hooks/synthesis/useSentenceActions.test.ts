// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSentenceActions } from "./useSentenceActions";

const mockShowNotification = vi.fn();
vi.mock("@/contexts/NotificationContext", () => ({
  useNotification: vi.fn(() => ({ showNotification: mockShowNotification })),
}));

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeAuto: vi.fn(),
}));

vi.mock("@/utils/clipboardUtils", () => ({
  copyTextToClipboard: vi.fn().mockResolvedValue(undefined),
}));

function makeDeps(overrides: Partial<Parameters<typeof useSentenceActions>[0]> = {}) {
  return {
    getSentence: vi.fn(),
    updateSentence: vi.fn(),
    synthesizeAndPlay: vi.fn(),
    synthesizeWithText: vi.fn(),
    handleRemoveSentence: vi.fn(),
    currentAudio: null,
    playlist: { isPlayingAll: false, isLoadingPlayAll: false, handlePlayAll: vi.fn() },
    ...overrides,
  };
}

describe("useSentenceActions handlePlay", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stops play-all when sentence is playing and playlist is active", () => {
    const handlePlayAll = vi.fn();
    const deps = makeDeps({
      getSentence: vi.fn().mockReturnValue({
        id: "1", text: "hello", tags: ["hello"], isPlaying: true, isLoading: false, currentInput: "",
      }),
      playlist: { isPlayingAll: true, isLoadingPlayAll: false, handlePlayAll },
    });
    const { result } = renderHook(() => useSentenceActions(deps));
    act(() => { result.current.handlePlay("1"); });
    expect(handlePlayAll).toHaveBeenCalled();
  });

  it("stops individual playback when sentence is playing and playlist is not active", () => {
    const mockAudio = { pause: vi.fn(), src: "test.mp3" } as unknown as HTMLAudioElement;
    const updateSentence = vi.fn();
    const deps = makeDeps({
      getSentence: vi.fn().mockReturnValue({
        id: "1", text: "hello", tags: ["hello"], isPlaying: true, isLoading: false, currentInput: "",
      }),
      currentAudio: mockAudio,
      updateSentence,
    });
    const { result } = renderHook(() => useSentenceActions(deps));
    act(() => { result.current.handlePlay("1"); });
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(updateSentence).toHaveBeenCalledWith("1", { isPlaying: false });
  });

  it("stops play-all when isLoadingPlayAll is true", () => {
    const handlePlayAll = vi.fn();
    const deps = makeDeps({
      getSentence: vi.fn().mockReturnValue({
        id: "1", text: "hello", tags: ["hello"], isPlaying: true, isLoading: false, currentInput: "",
      }),
      playlist: { isPlayingAll: false, isLoadingPlayAll: true, handlePlayAll },
    });
    const { result } = renderHook(() => useSentenceActions(deps));
    act(() => { result.current.handlePlay("1"); });
    expect(handlePlayAll).toHaveBeenCalled();
  });

  it("handles download error gracefully", async () => {
    const { synthesizeAuto } = await import("@/features/synthesis/utils/synthesize");
    vi.mocked(synthesizeAuto).mockRejectedValueOnce(new Error("synth fail"));
    const deps = makeDeps({
      getSentence: vi.fn().mockReturnValue({
        id: "1", text: "hello", tags: ["hello"], isPlaying: false, isLoading: false, currentInput: "", audioUrl: null,
      }),
    });
    const { result } = renderHook(() => useSentenceActions(deps));
    await act(async () => { await result.current.handleDownload("1"); });
    expect(deps.updateSentence).not.toHaveBeenCalled();
  });
});
