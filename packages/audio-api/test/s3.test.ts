// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { checkFileExists } from "../src/s3";
import type { S3ClientLike } from "../src/s3";

import { MockS3Client } from "./mocks";
import { TEST_BUCKET } from "./setup";

function createRejectingS3Mock(error: unknown): S3ClientLike {
  return { send: (): Promise<never> => Promise.reject(error) };
}

describe("S3 Cache Check", () => {
  let mockS3: MockS3Client;

  beforeEach(() => {
    mockS3 = new MockS3Client();
  });

  it("should return true when file exists", async () => {
    mockS3.setFileExists("cache/abc123.mp3", true);

    const exists = await checkFileExists(
      mockS3,
      TEST_BUCKET,
      "cache/abc123.mp3",
    );

    expect(exists).toBe(true);
  });

  it("should return false when file does not exist", async () => {
    mockS3.setFileExists("cache/abc123.mp3", false);

    const exists = await checkFileExists(
      mockS3,
      TEST_BUCKET,
      "cache/abc123.mp3",
    );

    expect(exists).toBe(false);
  });

  it("should throw error on connection errors", async () => {
    const error = new Error("Connection timeout") as Error & { name: string };
    error.name = "NetworkError";
    const mock = createRejectingS3Mock(error);

    await expect(
      checkFileExists(mock, TEST_BUCKET, "cache/abc123.mp3"),
    ).rejects.toThrow("Connection timeout");
  });

  it("should throw on non-S3 errors (primitive)", async () => {
    const mock = createRejectingS3Mock("string-error");

    await expect(
      checkFileExists(mock, TEST_BUCKET, "key"),
    ).rejects.toThrow("Unknown S3 error");
  });

  it("should return false for NoSuchKey error", async () => {
    const mock = createRejectingS3Mock({ name: "NoSuchKey", $metadata: {} });
    const exists = await checkFileExists(mock, TEST_BUCKET, "key");
    expect(exists).toBe(false);
  });

  it("should return false for 404 status code", async () => {
    const mock = createRejectingS3Mock({ name: "SomeError", $metadata: { httpStatusCode: 404 } });
    const exists = await checkFileExists(mock, TEST_BUCKET, "key");
    expect(exists).toBe(false);
  });

  it("should throw on null error", async () => {
    const mock = createRejectingS3Mock(null);
    await expect(checkFileExists(mock, TEST_BUCKET, "key")).rejects.toThrow("Unknown S3 error");
  });

  it("should throw on error with only $metadata (no name)", async () => {
    const mock = createRejectingS3Mock({ $metadata: { httpStatusCode: 500 } });
    await expect(checkFileExists(mock, TEST_BUCKET, "key")).rejects.toThrow("S3 error");
  });
});
