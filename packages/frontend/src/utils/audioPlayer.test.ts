import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAudioPlayer, playAudioWithCallbacks } from "./audioPlayer";

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
        if (url) this.src = url;
        mockAudio = this;
      }
    }

    global.Audio = MockAudio as unknown as typeof Audio;
    global.URL.revokeObjectURL = vi.fn();
  });

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

      mockAudio.onloadeddata!();
      expect(onLoaded).toHaveBeenCalled();

      mockAudio.onended!();
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

      mockAudio.onended!();
      expect(global.URL.revokeObjectURL).not.toHaveBeenCalled();

      cleanup();
    });

    it("should handle error callback", () => {
      const onError = vi.fn();

      createAudioPlayer("https://example.com/audio.mp3", { onError });

      mockAudio.onerror!();
      expect(onError).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

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

      mockAudio.onloadeddata!();
      expect(onLoaded).toHaveBeenCalled();

      mockAudio.onended!();
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

      mockAudio.onerror!();

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
          if (url) this.src = url;
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

      mockAudio.onended!();
      await playPromise;

      expect(mockAudio.play).toHaveBeenCalled();
    });
  });
});
