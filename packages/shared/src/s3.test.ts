// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { isNotFoundError, buildS3Url, checkFileExists } from "./s3";
import type { S3ClientLike } from "./s3";

describe("isNotFoundError", () => {
  it("returns true for NotFound name", () => {
    expect(isNotFoundError({ name: "NotFound" })).toBe(true);
  });

  it("returns true for NoSuchKey name", () => {
    expect(isNotFoundError({ name: "NoSuchKey" })).toBe(true);
  });

  it("returns true for 404 status code", () => {
    expect(isNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isNotFoundError({ name: "AccessDenied" })).toBe(false);
  });

  it("returns false for non-objects", () => {
    expect(isNotFoundError("string")).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
    expect(isNotFoundError(undefined)).toBe(false);
    expect(isNotFoundError(42)).toBe(false);
  });
});

describe("buildS3Url", () => {
  it("builds correct URL", () => {
    expect(buildS3Url("my-bucket", "eu-west-1", "cache/abc.wav")).toBe(
      "https://my-bucket.s3.eu-west-1.amazonaws.com/cache/abc.wav",
    );
  });
});

describe("checkFileExists", () => {
  it("returns true when object exists", async () => {
    const client: S3ClientLike = { send: vi.fn().mockResolvedValue({}) };
    expect(await checkFileExists(client, "bucket", "key")).toBe(true);
  });

  it("returns false for NotFound error", async () => {
    const client: S3ClientLike = {
      send: vi.fn().mockRejectedValue({ name: "NotFound" }),
    };
    expect(await checkFileExists(client, "bucket", "key")).toBe(false);
  });

  it("returns false for NoSuchKey error", async () => {
    const client: S3ClientLike = {
      send: vi.fn().mockRejectedValue({ name: "NoSuchKey" }),
    };
    expect(await checkFileExists(client, "bucket", "key")).toBe(false);
  });

  it("returns false for 404 status", async () => {
    const client: S3ClientLike = {
      send: vi.fn().mockRejectedValue({
        $metadata: { httpStatusCode: 404 },
      }),
    };
    expect(await checkFileExists(client, "bucket", "key")).toBe(false);
  });

  it("throws for unknown non-object errors", async () => {
    const client: S3ClientLike = {
      send: vi.fn().mockRejectedValue("bad"),
    };
    await expect(checkFileExists(client, "bucket", "key")).rejects.toThrow(
      "Unknown S3 error",
    );
  });

  it("throws for other S3 errors with details", async () => {
    const client: S3ClientLike = {
      send: vi.fn().mockRejectedValue({
        name: "AccessDenied",
        message: "forbidden",
        $metadata: { httpStatusCode: 403 },
      }),
    };
    await expect(checkFileExists(client, "bucket", "key")).rejects.toThrow(
      "S3 error",
    );
  });
});
