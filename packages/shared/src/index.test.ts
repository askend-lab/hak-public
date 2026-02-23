// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  calculateHash,
  createLogger,
  logger,
  TEXT_LIMITS,
  TIMING,
  sleep,
  isNonEmpty,
  isEmpty,
  getAwsRegion,
  isNotFoundError,
  buildS3Url,
  checkFileExists,
} from "./index";

describe("Index exports — behavioral verification", () => {
  it("calculateHash produces consistent SHA-256 hex", async () => {
    const hash = await calculateHash("tere");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(await calculateHash("tere")).toBe(hash);
  });

  it("createLogger respects minLevel filtering", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = createLogger("error");
    log.debug("should not appear");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("logger instance has info, warn, error methods", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("TEXT_LIMITS has positive audio text length limit", () => {
    expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe(100);
  });

  it("TIMING has expected poll interval", () => {
    expect(TIMING.POLL_INTERVAL_MS).toBe(1000);
  });

  it("sleep resolves after delay", async () => {
    const start = Date.now();
    await sleep(10);
    expect(Date.now() - start).toBeGreaterThanOrEqual(5);
  });

  it("isNonEmpty returns true for real strings, false for empty/null", () => {
    expect(isNonEmpty("hello")).toBe(true);
    expect(isNonEmpty("")).toBe(false);
    expect(isNonEmpty("   ")).toBe(false);
    expect(isNonEmpty(null)).toBe(false);
    expect(isNonEmpty(undefined)).toBe(false);
  });

  it("isEmpty is the inverse of isNonEmpty", () => {
    expect(isEmpty("hello")).toBe(false);
    expect(isEmpty("")).toBe(true);
    expect(isEmpty(null)).toBe(true);
  });

  it("getAwsRegion returns a valid AWS region string", () => {
    const region = getAwsRegion();
    expect(region).toMatch(/^[a-z]+-[a-z]+-\d+$/);
  });

  it("isNotFoundError detects S3 NotFound errors", () => {
    expect(isNotFoundError({ name: "NotFound" })).toBe(true);
    expect(isNotFoundError({ name: "NoSuchKey" })).toBe(true);
    expect(isNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(true);
    expect(isNotFoundError({ name: "AccessDenied" })).toBe(false);
    expect(isNotFoundError("not an error")).toBe(false);
  });

  it("buildS3Url produces correct S3 URL format", () => {
    const url = buildS3Url("my-bucket", "eu-west-1", "cache/key.wav");
    expect(url).toBe("https://my-bucket.s3.eu-west-1.amazonaws.com/cache/key.wav");
  });

  it("checkFileExists is an async function", () => {
    expect(typeof checkFileExists).toBe("function");
    // Full behavior tested in s3.test.ts with mocked S3 client
  });
});
