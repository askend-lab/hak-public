// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "./useAudioPlayer";

interface MockAudioInstance {
  src: string;
  onloadeddata: (() => void) | null;
  onended: (() => void) | null;
  onerror: (() => void) | null;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
}

function getAudioAt(arr: (MockAudioInstance | null)[], i: number): MockAudioInstance {
  const inst = arr[i];
  if (!inst) {throw new Error(`audioInstances[${i}] is null/undefined`);}
  return inst;
}

describe("useAudioPlayer", () => {
  let audioInstances: (MockAudioInstance | null)[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    audioInstances = [];

    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockResolvedValue(undefined);

      constructor(url?: string) {
        if (url) {this.src = url;}
        audioInstances.push(this);
      }
    }

    global.Audio = MockAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("playWithAbort", () => {
    it("should play audio with abort signal", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      const abortController = new AbortController();
      const onStart = vi.fn();
      const onEnded = vi.fn();

      const playPromise = act(async () => {
        return result.current.playWithAbort(
          "https://example.com/audio.mp3",
          abortController.signal,
          { onStart, onEnded },
        );
      });

      expect(onStart).toHaveBeenCalled();

      act(() => {
        getAudioAt(audioInstances, 0).onended?.();
      });

      const playResult = await playPromise;
      expect(playResult).toBe(true);
      expect(onEnded).toHaveBeenCalled();
      expect(result.current.currentAudio).toBeNull();
    });

    it("should handle abort signal", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      const abortController = new AbortController();
      const onStart = vi.fn();

      const playPromise = act(async () => {
        return result.current.playWithAbort(
          "https://example.com/audio.mp3",
          abortController.signal,
          { onStart },
        );
      });

      expect(onStart).toHaveBeenCalled();

      act(() => {
        abortController.abort();
      });

      const playResult = await playPromise;
      expect(playResult).toBe(false);
      expect(getAudioAt(audioInstances, 0).pause).toHaveBeenCalled();
      expect(result.current.currentAudio).toBeNull();
    });

    it("should return false if already aborted", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      const abortController = new AbortController();
      abortController.abort();

      const playResult = await act(async () => {
        return result.current.playWithAbort(
          "https://example.com/audio.mp3",
          abortController.signal,
        );
      });

      expect(playResult).toBe(false);
    });

    it("should handle audio error with abort signal", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      const abortController = new AbortController();
      const onError = vi.fn();

      const playPromise = act(async () => {
        return result.current.playWithAbort(
          "https://example.com/audio.mp3",
          abortController.signal,
          { onError },
        );
      });

      act(() => {
        getAudioAt(audioInstances, 0).onerror?.();
      });

      const playResult = await playPromise;
      expect(playResult).toBe(false);
      expect(onError).toHaveBeenCalled();
      expect(result.current.currentAudio).toBeNull();
    });

    it("should handle play rejection with abort signal", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      const abortController = new AbortController();
      const onError = vi.fn();

      class MockAudioWithError {
        src = "";
        onloadeddata: (() => void) | null = null;
        onended: (() => void) | null = null;
        onerror: (() => void) | null = null;
        pause = vi.fn();
        play = vi.fn().mockRejectedValue(new Error("Play failed"));

        constructor(url?: string) {
          if (url) {this.src = url;}
          audioInstances[0] = this;
        }
      }
      global.Audio = MockAudioWithError as unknown as typeof Audio;

      const playResult = await act(async () => {
        return result.current.playWithAbort(
          "https://example.com/audio.mp3",
          abortController.signal,
          { onError },
        );
      });

      expect(playResult).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe("stopCurrentAudio", () => {
    it("should stop current audio", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        void result.current.playAudio("https://example.com/audio.mp3");
      });

      expect(result.current.currentAudio).not.toBeNull();

      act(() => {
        result.current.stopCurrentAudio();
      });

      expect(getAudioAt(audioInstances, 0).pause).toHaveBeenCalled();
      expect(getAudioAt(audioInstances, 0).src).toBe("");
      expect(result.current.currentAudio).toBeNull();
    });

    it("should do nothing if no audio is playing", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.stopCurrentAudio();
      });

      expect(result.current.currentAudio).toBeNull();
    });
  });

});
