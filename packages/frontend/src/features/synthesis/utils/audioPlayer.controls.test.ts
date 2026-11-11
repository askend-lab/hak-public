// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Sentry from "@sentry/react";
import { playAudioWithCallbacks } from "./audioPlayer";

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

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

  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("group 2", () => {
  describe("playAudioWithCallbacks", () => {
    it("should play audio and resolve on success", async () => {
      const onLoaded = vi.fn();
      const onEnded = vi.fn();

      const playPromise = playAudioWithCallbacks(
        "https://example.com/audio.mp3",
        {
          onLoaded,
          onEnded,
        },
      );

      mockAudio.onloadeddata?.();
      expect(onLoaded).toHaveBeenCalled();

      mockAudio.onended?.();
      await playPromise;

      expect(onEnded).toHaveBeenCalled();
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it("should reject on error", async () => {
      const onError = vi.fn();

      const playPromise = playAudioWithCallbacks(
        "https://example.com/audio.mp3",
        { onError },
      );

      mockAudio.onerror?.();

      await expect(playPromise).rejects.toThrow("Audio playback failed");
      expect(onError).toHaveBeenCalled();
    });

    it("should reject on play failure", async () => {
      class MockAudioWithError {
        src = "";
        onloadeddata: (() => void) | null = null;
        onended: (() => void) | null = null;
        onerror: (() => void) | null = null;
        pause = vi.fn();
        play = vi.fn().mockRejectedValue(new Error("Play failed"));

        constructor(url?: string) {
          if (url) {this.src = url;}
          mockAudio = this;
        }
      }

      global.Audio = MockAudioWithError as unknown as typeof Audio;

      await expect(
        playAudioWithCallbacks("https://example.com/audio.mp3"),
      ).rejects.toThrow();
    });

    it("should work without callbacks", async () => {
      const playPromise = playAudioWithCallbacks(
        "https://example.com/audio.mp3",
      );

      mockAudio.onended?.();
      await playPromise;

      expect(mockAudio.play).toHaveBeenCalled();
    });

    it("should revoke URL on ended when shouldRevokeUrl is true", async () => {
      const playPromise = playAudioWithCallbacks(
        "blob:https://example.com/audio",
        {},
        true,
      );

      mockAudio.onended?.();
      await playPromise;

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(
        "blob:https://example.com/audio",
      );
    });

    it("should not revoke URL when shouldRevokeUrl is false", async () => {
      const playPromise = playAudioWithCallbacks(
        "https://example.com/audio.mp3",
        {},
        false,
      );

      mockAudio.onended?.();
      await playPromise;

      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();
    });

    it("should revoke URL on error", async () => {
      const playPromise = playAudioWithCallbacks(
        "blob:https://example.com/audio",
        {},
        true,
      );

      mockAudio.onerror?.();

      await expect(playPromise).rejects.toThrow("Audio playback failed");
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(
        "blob:https://example.com/audio",
      );
    });

    it("should report audio error to Sentry with audioUrl context", async () => {
      const playPromise = playAudioWithCallbacks(
        "blob:https://example.com/test-audio",
      );

      mockAudio.onerror?.();

      await expect(playPromise).rejects.toThrow("Audio playback failed");
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Audio playback failed" }),
        {
          tags: { audio: "playback" },
          extra: { audioUrl: "blob:https://example.com/test-audio" },
        },
      );
    });
  });

  });

  });

  });

  });

  });

});
