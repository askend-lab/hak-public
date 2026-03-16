// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSharedTaskAudio } from "./useSharedTaskAudio";
import {
  FakeAudio, resetAudioMocks, setNextPlayReject,
  getAudioInstances, audioAt, lastAudio, makeEntry, makeBlob,
} from "@/test/audioMockHelpers";

vi.mock("@/utils/synthesize", () => ({
  synthesizeWithPolling: vi.fn().mockResolvedValue("blob:synth-url"),
}));
vi.mock("@/types/synthesis", () => ({ getVoiceModel: vi.fn(() => "voice") }));

beforeEach(() => {
  resetAudioMocks();
  vi.stubGlobal("Audio", FakeAudio);
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:obj-url");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("useSharedTaskAudio mutation kills", () => {
  beforeEach(() => vi.clearAllMocks());

  it("initializes with null/false values", () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    expect(result.current.currentPlayingId).toBeNull();
    expect(result.current.currentLoadingId).toBeNull();
    expect(result.current.isPlayingAll).toBe(false);
    expect(result.current.isLoadingPlayAll).toBe(false);
  });

  it("handlePlayEntry returns early for unknown entry", () => {
    const { result } = renderHook(() => useSharedTaskAudio());
    act(() => result.current.handlePlayEntry("missing", [makeEntry("e1")]));
    expect(result.current.currentPlayingId).toBeNull();
  });

  describe("synthesizeAndPlay event handlers", () => {
    it("onloadeddata clears loading and sets playing", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1")]));
      expect(result.current.currentLoadingId).toBe("e1");
      await act(async () => lastAudio().onloadeddata?.());
      expect(result.current.currentLoadingId).toBeNull();
      expect(result.current.currentPlayingId).toBe("e1");
    });

    it("onended clears playing and revokes URL", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1")]));
      const audio = lastAudio();
      await act(async () => audio.onloadeddata?.());
      await act(async () => audio.onended?.());
      expect(result.current.currentPlayingId).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:synth-url");
    });

    it("onerror clears state and revokes URL", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1")]));
      await act(async () => lastAudio().onerror?.());
      expect(result.current.currentPlayingId).toBeNull();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:synth-url");
    });

    it("synthesize failure resets both ids", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1")]));
      expect(result.current.currentPlayingId).toBeNull();
      expect(result.current.currentLoadingId).toBeNull();
    });
  });

  describe("handlePlayEntry with audioUrl", () => {
    it("sets currentPlayingId and plays", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioUrl: "http://a.mp3" })]));
      expect(result.current.currentPlayingId).toBe("e1");
      expect(lastAudio().play).toHaveBeenCalled();
    });

    it("onended does NOT revoke audioUrl", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioUrl: "http://a.mp3" })]));
      await act(async () => lastAudio().onended?.());
      expect(result.current.currentPlayingId).toBeNull();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it("onerror does NOT revoke, falls back to synthesize", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioUrl: "http://a.mp3" })]));
      await act(async () => lastAudio().onerror?.());
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
      expect(result.current.currentLoadingId).toBe("e1");
    });

    it("play().catch falls back to synthesize", async () => {
      setNextPlayReject();
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioUrl: "http://a.mp3" })]));
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe("handlePlayEntry with audioBlob", () => {
    it("creates objectURL and plays", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: makeBlob() })]));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(result.current.currentPlayingId).toBe("e1");
    });

    it("onended revokes blob URL", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: makeBlob(), audioUrl: "http://x" })]));
      await act(async () => lastAudio().onended?.());
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:obj-url");
    });

    it("onerror revokes blob URL, falls back to synthesize", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: makeBlob() })]));
      await act(async () => lastAudio().onerror?.());
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:obj-url");
      expect(result.current.currentLoadingId).toBe("e1");
    });

    it("play().catch revokes blob URL", async () => {
      setNextPlayReject();
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: makeBlob() })]));
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:obj-url");
    });

    it("does not play zero-size audioBlob", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: makeBlob(0) })]));
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      expect(result.current.currentLoadingId).toBe("e1");
    });

    it("prefers audioBlob over audioUrl", async () => {
      const blob = makeBlob();
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioBlob: blob, audioUrl: "http://a.mp3" })]));
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    });
  });

  describe("handlePlayEntry edge cases", () => {
    it("whitespace-only audioUrl falls through to synthesize", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1", { audioUrl: "   " })]));
      expect(result.current.currentLoadingId).toBe("e1");
    });

    it("null audio triggers synthesize", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => result.current.handlePlayEntry("e1", [makeEntry("e1")]));
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      expect(synthesizeWithPolling).toHaveBeenCalledWith("stressed-e1", "voice");
    });
  });

  describe("handlePlayAll", () => {
    it("does nothing with empty entries", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => { await result.current.handlePlayAll([]); });
      expect(result.current.isPlayingAll).toBe(false);
      expect(result.current.isLoadingPlayAll).toBe(false);
    });

    it("plays entries sequentially", async () => {
      const entries = [makeEntry("e1", { audioUrl: "http://a.mp3" }), makeEntry("e2", { audioUrl: "http://b.mp3" })];
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => {
        const p = result.current.handlePlayAll(entries);
        await vi.waitFor(() => expect(getAudioInstances().length).toBe(1));
        audioAt(0).onloadeddata?.();
        audioAt(0).onended?.();
        await vi.waitFor(() => expect(getAudioInstances().length).toBe(2));
        audioAt(1).onloadeddata?.();
        audioAt(1).onended?.();
        await p;
      });
      expect(result.current.isPlayingAll).toBe(false);
      expect(result.current.currentPlayingId).toBeNull();
    });

    it("breaks loop when entry fails", async () => {
      const { synthesizeWithPolling } = await import("@/utils/synthesize");
      (synthesizeWithPolling as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("fail"));
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => { await result.current.handlePlayAll([makeEntry("e1"), makeEntry("e2", { audioUrl: "http://b.mp3" })]); });
      expect(getAudioInstances().length).toBe(0);
      expect(result.current.isPlayingAll).toBe(false);
    });
  });

  describe("playSingleEntry paths", () => {
    it("audioBlob creates objectURL, revokes on cleanup", async () => {
      const blob = makeBlob(50);
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => {
        const p = result.current.handlePlayAll([makeEntry("e1", { audioBlob: blob })]);
        await vi.waitFor(() => expect(getAudioInstances().length).toBe(1));
        audioAt(0).onloadeddata?.();
        audioAt(0).onended?.();
        await p;
      });
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:obj-url");
    });

    it("audioUrl does not revoke", async () => {
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => {
        const p = result.current.handlePlayAll([makeEntry("e1", { audioUrl: "http://a.mp3" })]);
        await vi.waitFor(() => expect(getAudioInstances().length).toBe(1));
        audioAt(0).onloadeddata?.();
        audioAt(0).onended?.();
        await p;
      });
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it("onerror resolves false, breaks loop", async () => {
      const entries = [makeEntry("e1", { audioUrl: "http://a.mp3" }), makeEntry("e2", { audioUrl: "http://b.mp3" })];
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => {
        const p = result.current.handlePlayAll(entries);
        await vi.waitFor(() => expect(getAudioInstances().length).toBe(1));
        audioAt(0).onerror?.();
        await p;
      });
      expect(getAudioInstances().length).toBe(1);
      expect(result.current.isPlayingAll).toBe(false);
    });

    it("play().catch resolves false", async () => {
      setNextPlayReject();
      const { result } = renderHook(() => useSharedTaskAudio());
      await act(async () => { await result.current.handlePlayAll([makeEntry("e1", { audioUrl: "http://a.mp3" })]); });
      expect(result.current.isPlayingAll).toBe(false);
    });
  });
});
