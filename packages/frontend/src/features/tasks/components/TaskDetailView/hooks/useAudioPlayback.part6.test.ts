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

  it("handlePlayAll transitions from loading to playing after first entry", async () => {
    const entries = [
      mockEntry("1", "t1", "http://a1.mp3"),
      mockEntry("2", "t2", "http://a2.mp3"),
    ];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { await result.current.handlePlayAll(); });
    // After completion, all states reset
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("handlePlayEntry with audioUrl sets playing state", () => {
    const entries = [mockEntry("1", "test", "http://audio.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayEntry("1"); });
    expect(result.current.currentPlayingId).toBe("1");
    expect(result.current.currentLoadingId).toBeNull();
  });

  it("handlePlayEntry with non-trimmed empty audioUrl synthesizes", async () => {
    const entries = [mockEntry("1", "test", "")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { result.current.handlePlayEntry("1"); });
    const { synthesizeWithPolling } = await import("@/features/synthesis/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalled();
  });

});
