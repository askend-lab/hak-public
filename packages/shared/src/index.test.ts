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

describe("Index exports", () => {
  it("should export calculateHash", () => {
    expect(typeof calculateHash).toBe("function");
  });

  it("should export createLogger", () => {
    expect(typeof createLogger).toBe("function");
  });

  it("should export logger instance", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
  });

  it("should export TEXT_LIMITS", () => {
    expect(TEXT_LIMITS).toBeDefined();
    expect(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH).toBe(100);
  });

  it("should export TIMING", () => {
    expect(TIMING).toBeDefined();
    expect(TIMING.POLL_INTERVAL_MS).toBe(1000);
  });

  it("should export sleep", () => {
    expect(typeof sleep).toBe("function");
  });

  it("should export isNonEmpty", () => {
    expect(typeof isNonEmpty).toBe("function");
  });

  it("should export isEmpty", () => {
    expect(typeof isEmpty).toBe("function");
  });

  it("should export getAwsRegion", () => {
    expect(typeof getAwsRegion).toBe("function");
  });

  it("should export isNotFoundError", () => {
    expect(typeof isNotFoundError).toBe("function");
  });

  it("should export buildS3Url", () => {
    expect(typeof buildS3Url).toBe("function");
  });

  it("should export checkFileExists", () => {
    expect(typeof checkFileExists).toBe("function");
  });
});
