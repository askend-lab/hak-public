// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { checkFileExists } from "../src/s3";
import type { S3ClientLike } from "../src/s3";

import { MockS3Client } from "./mocks";

describe("S3 Cache Check", () => {
  let mockS3: MockS3Client;

  beforeEach(() => {
    mockS3 = new MockS3Client();
  });

  it("should return true when file exists", async () => {
    mockS3.setFileExists("cache/abc123.mp3", true);

    const exists = await checkFileExists(
      mockS3 as unknown as S3ClientLike,
      "test-bucket",
      "cache/abc123.mp3",
    );

    expect(exists).toBe(true);
  });

  it("should return false when file does not exist", async () => {
    mockS3.setFileExists("cache/abc123.mp3", false);

    const exists = await checkFileExists(
      mockS3 as unknown as S3ClientLike,
      "test-bucket",
      "cache/abc123.mp3",
    );

    expect(exists).toBe(false);
  });

  it("should throw error on connection errors", async () => {
    const mockS3WithError = {
      send: (): never => {
        const error = new Error("Connection timeout") as Error & {
          name: string;
        };
        error.name = "NetworkError";
        throw error;
      },
    };

    await expect(
      checkFileExists(mockS3WithError, "test-bucket", "cache/abc123.mp3"),
    ).rejects.toThrow("Connection timeout");
  });

  it("should throw on non-S3 errors (primitive)", async () => {
    const mockS3Primitive = {
      send: (): Promise<never> => Promise.reject("string-error"),
    };

    await expect(
      checkFileExists(mockS3Primitive, "test-bucket", "key"),
    ).rejects.toThrow("Unknown S3 error");
  });

  it("should return false for NoSuchKey error", async () => {
    const mockS3NoSuchKey = {
      send: (): Promise<never> => {
        const error = { name: "NoSuchKey", $metadata: {} };
        return Promise.reject(error);
      },
    };
    const exists = await checkFileExists(mockS3NoSuchKey, "test-bucket", "key");
    expect(exists).toBe(false);
  });

  it("should return false for 404 status code", async () => {
    const mockS3Status404 = {
      send: (): Promise<never> => {
        const error = { name: "SomeError", $metadata: { httpStatusCode: 404 } };
        return Promise.reject(error);
      },
    };
    const exists = await checkFileExists(mockS3Status404, "test-bucket", "key");
    expect(exists).toBe(false);
  });

  it("should throw on null error", async () => {
    const mockS3Null = {
      send: (): Promise<never> => Promise.reject(null),
    };
    await expect(checkFileExists(mockS3Null, "test-bucket", "key")).rejects.toThrow("Unknown S3 error");
  });

  it("should throw on error with only $metadata (no name)", async () => {
    const mockS3Meta = {
      send: (): Promise<never> => {
        const error = { $metadata: { httpStatusCode: 500 } };
        return Promise.reject(error);
      },
    };
    await expect(checkFileExists(mockS3Meta, "test-bucket", "key")).rejects.toThrow("S3 error");
  });
});
