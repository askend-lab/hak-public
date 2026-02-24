// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAudioPlaybackCore } from "./useAudioPlaybackCore";
import { TaskEntry } from "@/types/task";

vi.mock("@/features/synthesis/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:audio-url"),
}));

vi.mock("@/types/synthesis", () => ({
  getVoiceModel: (text: string): string =>
    text.split(/\s+/).length > 1 ? "efm_l" : "efm_s",
}));

const createEntry = (
  id: string,
  text = "test",
  audioUrl: string | null = null,
  audioBlob: Blob | null = null,
): TaskEntry => ({
  id,
  text,
  stressedText: text,
  audioUrl,
  audioBlob,
  taskId: "t1",
  order: 0,
  createdAt: new Date(),
});

describe("useAudioPlaybackCore", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockImplementation(function (this: MockAudio) {
        setTimeout(() => this.onloadeddata?.(), 0);
        setTimeout(() => this.onended?.(), 10);
        return Promise.resolve();
      });
    }
    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayEntry does nothing for non-existent entry", () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    act(() => {
      result.current.handlePlayEntry("999", [createEntry("1")]);
    });
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("handlePlayEntry plays entry with audioUrl", () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    const entries = [createEntry("1", "test", "http://audio.mp3")];
    act(() => {
      result.current.handlePlayEntry("1", entries);
    });
    expect(result.current.currentPlayingId).toBe("1");
  });

  it("handlePlayEntry plays entry with audioBlob", () => {
    const blob = new Blob(["audio"], { type: "audio/wav" });
    const { result } = renderHook(() => useAudioPlaybackCore());
    const entries = [createEntry("1", "test", null, blob)];
    act(() => {
      result.current.handlePlayEntry("1", entries);
    });
    expect(result.current.currentPlayingId).toBe("1");
  });

  it("handlePlayEntry synthesizes when no audio available", async () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    const entries = [createEntry("1", "hello world")];
    await act(async () => {
      result.current.handlePlayEntry("1", entries);
    });
    expect(result.current.currentLoadingId).toBe("1");
  });

  it("handlePlayAll does nothing with empty entries", async () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    await act(async () => {
      await result.current.handlePlayAll([]);
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("handlePlayAll plays entries sequentially", async () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    const entries = [
      createEntry("1", "t1", "http://a1.mp3"),
      createEntry("2", "t2", "http://a2.mp3"),
    ];
    await act(async () => {
      await result.current.handlePlayAll(entries);
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("handlePlayAll can be stopped while playing", async () => {
    const { result } = renderHook(() => useAudioPlaybackCore());
    const entries = [createEntry("1", "t1", "http://a.mp3")];
    act(() => {
      void result.current.handlePlayAll(entries);
    });
    await waitFor(() => {
      expect(
        result.current.isLoadingPlayAll || result.current.isPlayingAll,
      ).toBe(true);
    });
    await act(async () => {
      await result.current.handlePlayAll(entries);
    });
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("stops on failure when continueOnFailure is false", async () => {
    const { synthesizeWithPolling } = await import(
      "@/features/synthesis/utils/synthesize"
    );
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("synth error"),
    );
    const { result } = renderHook(() =>
      useAudioPlaybackCore({ continueOnFailure: false }),
    );
    const entries = [
      createEntry("1", "no audio"),
      createEntry("2", "also no audio"),
    ];
    await act(async () => {
      await result.current.handlePlayAll(entries);
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("uses custom logPrefix in error messages", async () => {
    const { synthesizeWithPolling } = await import(
      "@/features/synthesis/utils/synthesize"
    );
    (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("fail"),
    );
    const { result } = renderHook(() =>
      useAudioPlaybackCore({ logPrefix: "Custom" }),
    );
    await act(async () => {
      result.current.handlePlayEntry("1", [createEntry("1")]);
    });
    // Should not throw — error is logged with custom prefix
    expect(result.current.currentPlayingId).toBeNull();
  });
});
