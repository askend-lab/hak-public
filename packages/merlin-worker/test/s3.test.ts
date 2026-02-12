// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { uploadAudio, buildCacheKey, AUDIO_CONTENT_TYPE } from "../src/s3";
import { createMockS3Client, TEST_BUCKET } from "./setup";

const mockS3Client = createMockS3Client();

describe("S3 Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("buildCacheKey", () => {
    it("should return cache path with .mp3 extension", () => {
      expect(buildCacheKey("abc123")).toBe("cache/abc123.mp3");
    });

    it("should include hash in path", () => {
      const key = buildCacheKey("test-hash");
      expect(key).toContain("test-hash");
      expect(key).toMatch(/^cache\/.+\.mp3$/);
    });
  });

  describe("uploadAudio", () => {
    it("should upload audio buffer to S3 with correct key", async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from("fake audio data");

      await uploadAudio(
        mockS3Client,
        TEST_BUCKET,
        "abc123def456",
        audioBuffer,
      );

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it("should use cache/{hash}.mp3 as key format", async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from("fake audio data");

      await uploadAudio(
        mockS3Client,
        TEST_BUCKET,
        "myhash123",
        audioBuffer,
      );

      const call = mockS3Client.send.mock.calls[0][0];
      expect(call.input.Key).toBe("cache/myhash123.mp3");
    });

    it("should set correct content type", async () => {
      mockS3Client.send.mockResolvedValue({});
      const audioBuffer = Buffer.from("fake audio data");

      await uploadAudio(mockS3Client, TEST_BUCKET, "hash123", audioBuffer);

      const call = mockS3Client.send.mock.calls[0][0];
      expect(call.input.ContentType).toBe(AUDIO_CONTENT_TYPE);
    });

    it("should throw error on upload failure", async () => {
      mockS3Client.send.mockRejectedValue(new Error("Upload failed"));
      const audioBuffer = Buffer.from("fake audio data");

      await expect(
        uploadAudio(mockS3Client, TEST_BUCKET, "hash", audioBuffer),
      ).rejects.toThrow("Upload failed");
    });
  });

  describe("AUDIO_CONTENT_TYPE", () => {
    it("should be audio/mpeg", () => {
      expect(AUDIO_CONTENT_TYPE).toBe("audio/mpeg");
    });
  });
});
