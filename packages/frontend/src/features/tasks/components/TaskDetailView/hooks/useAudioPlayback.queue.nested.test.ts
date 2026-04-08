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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  it("handlePlayAll resets all states when called twice", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test", "http://a.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { void result.current.handlePlayAll(); });
    await waitFor(() => {
      expect(result.current.isLoadingPlayAll || result.current.isPlayingAll).toBe(true);
    });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("revokeObjectURL called for blob entry after playback", async () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const entries = [mockEntry("1", "test", null, blob)];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => { await result.current.handlePlayAll(); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("handlePlayAll stops current audio when toggled off", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test", "http://a.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { void result.current.handlePlayAll(); });
    await waitFor(() => {
      expect(result.current.isLoadingPlayAll || result.current.isPlayingAll).toBe(true);
    });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
  });

  });

  });

  });

  });

  });

});
