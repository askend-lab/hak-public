// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { synthesize, DEFAULT_VOICE, CONTENT_TYPE_JSON } from "../src/merlin";
import { TEST_MERLIN_URL } from "./setup";

global.fetch = jest.fn();

describe("Merlin TTS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("synthesize", () => {
    it("should call Merlin API with text and return audio buffer", async () => {
      const mockAudioBase64 = Buffer.from("fake audio data").toString("base64");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            audio: mockAudioBase64,
            format: "wav",
          }),
      });

      const result = await synthesize(
        "tere päevast",
        TEST_MERLIN_URL,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        TEST_MERLIN_URL,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": CONTENT_TYPE_JSON },
          body: JSON.stringify({
            text: "tere päevast",
            voice: DEFAULT_VOICE,
            returnBase64: true,
          }),
        }),
      );
      expect(result).toBeInstanceOf(Buffer);
    });

    it("should throw error when API returns error", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(
        synthesize("tere", TEST_MERLIN_URL),
      ).rejects.toThrow("Merlin API error: 500");
    });

    it("should throw error when fetch fails", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        synthesize("tere", TEST_MERLIN_URL),
      ).rejects.toThrow("Network error");
    });

    it("should use custom voice when provided", async () => {
      const mockAudioBase64 = Buffer.from("audio").toString("base64");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ audio: mockAudioBase64, format: "wav" }),
      });

      await synthesize("tere", TEST_MERLIN_URL, "custom_voice");

      expect(global.fetch).toHaveBeenCalledWith(
        TEST_MERLIN_URL,
        expect.objectContaining({
          body: JSON.stringify({
            text: "tere",
            voice: "custom_voice",
            returnBase64: true,
          }),
        }),
      );
    });
  });

  describe("DEFAULT_VOICE", () => {
    it("should be efm_s", () => {
      expect(DEFAULT_VOICE).toBe("efm_s");
    });
  });

  describe("CONTENT_TYPE_JSON", () => {
    it("should be application/json", () => {
      expect(CONTENT_TYPE_JSON).toBe("application/json");
    });
  });
});
