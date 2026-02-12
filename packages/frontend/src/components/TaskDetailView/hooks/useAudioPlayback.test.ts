// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

vi.mock("@/utils/synthesize", () => ({
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

describe("useAudioPlayback initialization", () => {
  it("initializes with null states", () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });
});

describe("useAudioPlayback handlePlayEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing for non-existent entry", () => {
    const { result } = renderHook(() => useAudioPlayback([mockEntry("1")]));
    act(() => {
      result.current.handlePlayEntry("999");
    });
    expect(result.current.currentPlayingId).toBeNull();
  });

  it("synthesizes audio when no audioUrl or audioBlob", async () => {
    const entries = [mockEntry("1", "hello world")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    expect(result.current.currentLoadingId).toBe("1");
  });
});

describe("useAudioPlayback handlePlayAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing with empty entries", async () => {
    const { result } = renderHook(() => useAudioPlayback([]));
    await act(async () => {
      await result.current.handlePlayAll();
    });
    expect(result.current.isPlayingAll).toBe(false);
  });

  it("starts loading when called with entries", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      result.current.handlePlayAll();
    });
    await waitFor(() => {
      expect(result.current.isLoadingPlayAll).toBe(true);
    });
  });
});

describe("getVoiceModel logic", () => {
  it("uses efm_s for single word", async () => {
    const entries = [mockEntry("1", "word")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("word", "efm_s");
  });

  it("uses efm_l for multiple words", async () => {
    const entries = [mockEntry("1", "hello world")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    await act(async () => {
      result.current.handlePlayEntry("1");
    });
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("hello world", "efm_l");
  });
});

describe("useAudioPlayback with existing audio", () => {
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
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalledWith("test", "efm_s");
  });

  it("stops playback when handlePlayAll called while playing", async () => {
    const entries = [mockEntry("1", "test")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => {
      result.current.handlePlayAll();
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
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
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
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
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
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
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

  it("handlePlayAll resets all states when called twice", async () => {
    const { waitFor } = await import("@testing-library/react");
    const entries = [mockEntry("1", "test", "http://a.mp3")];
    const { result } = renderHook(() => useAudioPlayback(entries));
    act(() => { result.current.handlePlayAll(); });
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
    act(() => { result.current.handlePlayAll(); });
    await waitFor(() => {
      expect(result.current.isLoadingPlayAll || result.current.isPlayingAll).toBe(true);
    });
    await act(async () => { await result.current.handlePlayAll(); });
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
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
    const { synthesizeWithPolling } = await import("@/utils/synthesize");
    expect(synthesizeWithPolling).toHaveBeenCalled();
  });
});
