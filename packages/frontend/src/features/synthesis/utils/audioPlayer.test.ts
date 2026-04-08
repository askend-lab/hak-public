// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAudioPlayer } from "./audioPlayer";

interface MockAudioInstance {
  src: string;
  onloadeddata: (() => void) | null;
  onended: (() => void) | null;
  onerror: (() => void) | null;
  pause: ReturnType<typeof vi.fn>;
  play: ReturnType<typeof vi.fn>;
}

describe("audioPlayer", () => {
  let mockAudio: MockAudioInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    class MockAudio {
      src = "";
      onloadeddata: (() => void) | null = null;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      pause = vi.fn();
      play = vi.fn().mockResolvedValue(undefined);

      constructor(url?: string) {
        if (url) {this.src = url;}
        mockAudio = this;
      }
    }

    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.revokeObjectURL = vi.fn();
  });

  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("group 1", () => {
  describe("createAudioPlayer", () => {
    it("should create audio player with callbacks", () => {
      const onLoaded = vi.fn();
      const onEnded = vi.fn();
      const onError = vi.fn();

      const { audio, cleanup } = createAudioPlayer(
        "https://example.com/audio.mp3",
        {
          onLoaded,
          onEnded,
          onError,
        },
      );

      expect(audio).toBe(mockAudio);
      expect(mockAudio.src).toBe("https://example.com/audio.mp3");

      mockAudio.onloadeddata?.();
      expect(onLoaded).toHaveBeenCalled();

      mockAudio.onended?.();
      expect(onEnded).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(
        "https://example.com/audio.mp3",
      );

      cleanup();
    });

    it("should not revoke URL if shouldRevokeUrl is false", () => {
      const { cleanup } = createAudioPlayer(
        "https://example.com/audio.mp3",
        {},
        false,
      );

      mockAudio.onended?.();
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();

      cleanup();
    });

    it("should handle error callback", () => {
      const onError = vi.fn();

      createAudioPlayer("https://example.com/audio.mp3", { onError });

      mockAudio.onerror?.();
      expect(onError).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  });

  });

  });

  });

  });

});
