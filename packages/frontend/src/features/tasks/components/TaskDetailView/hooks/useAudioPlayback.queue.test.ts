// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:audio-url"),
}));

const mockEntry = (
  id: string,
  text = "test",
  audioUrl: string | null = null,
  audioBlob: Blob | null = null,
): {
  id: string;
  text: string;
  stressedText: string;
  audioUrl: string | null;
  audioBlob: Blob | null;
  taskId: string;
  order: number;
  createdAt: Date;
} => ({
  id,
  text,
  stressedText: text,
  audioUrl,
  audioBlob,
  taskId: "t1",
  order: 0,
  createdAt: new Date(),
});

describe("useAudioPlayback with existing audio", () => {
  const pendingTimers: ReturnType<typeof setTimeout>[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    pendingTimers.length = 0;
    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(function (this: MockAudio) {
        pendingTimers.push(setTimeout(() => this.onloadeddata?.(), 0));
        pendingTimers.push(setTimeout(() => this.onended?.(), 10));
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    pendingTimers.forEach(clearTimeout);
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  it("plays entry with audioUrl directly", () => {
    const entries = [mockEntry("1", "test", "http://audio.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      result.current.handlePlayEntry("1");
    });
    expect(result.current.currentPlayingId).toBe("1");
  });

  it("plays entry with audioBlob", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const entries = [mockEntry("1", "test", null, blob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      result.current.handlePlayEntry("1");
    });
    expect(result.current.currentPlayingId).toBe("1");
  });

  it("ignores empty audioUrl and synthesizes instead", async () => {
    const entries = [mockEntry("1", "test", "  ")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("test", "efm_s");
  });

  it("stops playback when handlePlayAll called while playing", async () => {
    const entries = [mockEntry("1", "test")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      void result.current.handlePlayAll();
    });
    expect(result.current.isLoadingPlayAll).toBe(true);
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayAll completes with audioUrl entries", async () => {
    const entries = [
      mockEntry("1", "test1", "http://audio1.mp3"),
      mockEntry("2", "test2", "http://audio2.mp3"),
    ];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayAll with audioBlob entries completes successfully", async () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const entries = [mockEntry("1", "test1", null, blob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("handlePlayAll with synthesis failure in playSingleEntry", async () => {
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("synth error"),
    );
    const entries = [mockEntry("1", "no audio")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("synthesizeAndPlay handles synthesis error", async () => {
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("fail"),
    );
    const entries = [mockEntry("1", "test")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("ignores audioBlob with size 0 and synthesizes", async () => {
    const emptyBlob = new Blob([], { type: "audio/wav" });
    const entries = [mockEntry("1", "test", null, emptyBlob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalled();
  });

  it("creates blob URL for audioBlob entries", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const entries = [mockEntry("1", "test", null, blob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayEntry("1"); });
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it("onended callback resets currentPlayingId to null", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test", "http://audio.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayEntry("1"); });
    expect(result.current.currentPlayingId).toBe("1");
    await waitFor(() => {
      expect(result.current.currentPlayingId).toBeNull();
    });
  });

  });

  });

  });

  });

  });

});
