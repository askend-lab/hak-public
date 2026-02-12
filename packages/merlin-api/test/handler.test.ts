// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { generateCacheKey, resetRateLimit } from "../src/handler";
import type { SynthesizeRequest } from "../src/handler";
import { createResponse, createInternalError, HTTP_STATUS, CORS_HEADERS } from "../src/response";
import { buildAudioUrl, buildCacheKey } from "../src/s3";
import { VOICE_DEFAULTS } from "../src/env";

process.env.AWS_REGION_NAME = "eu-west-1";
process.env.S3_BUCKET = "test-bucket";
process.env.SQS_QUEUE_URL = "https://sqs.eu-west-1.amazonaws.com/123456789/test-queue";

describe("generateCacheKey", () => {
  it("should return consistent hash for same input", () => {
    const key1 = generateCacheKey("hello", "efm_l", 1.0, 0);
    const key2 = generateCacheKey("hello", "efm_l", 1.0, 0);
    expect(key1).toBe(key2);
  });

  it("should return different hash for different text", () => {
    const key1 = generateCacheKey("hello", "efm_l", 1.0, 0);
    const key2 = generateCacheKey("world", "efm_l", 1.0, 0);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different voice", () => {
    const key1 = generateCacheKey("hello", "efm_l", 1.0, 0);
    const key2 = generateCacheKey("hello", "other", 1.0, 0);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different speed", () => {
    const key1 = generateCacheKey("hello", "efm_l", 1.0, 0);
    const key2 = generateCacheKey("hello", "efm_l", 1.5, 0);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different pitch", () => {
    const key1 = generateCacheKey("hello", "efm_l", 1.0, 0);
    const key2 = generateCacheKey("hello", "efm_l", 1.0, 1);
    expect(key1).not.toBe(key2);
  });

  it("should return a 64-char hex string (sha256)", () => {
    const key = generateCacheKey("test", "efm_l", 1.0, 0);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("createResponse", () => {
  it("should return response with CORS headers", () => {
    const response = createResponse(HTTP_STATUS.OK, { status: "ok" });

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS });
    expect(JSON.parse(response.body)).toStrictEqual({ status: "ok" });
  });
});

describe("createInternalError", () => {
  it("should return 500 with generic error message", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const response = createInternalError("Test context", new Error("fail"));

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(response.body).error).toBe("Internal server error");
    expect(spy).toHaveBeenCalledWith("Test context:", expect.any(Error));
    spy.mockRestore();
  });
});

describe("HTTP_STATUS", () => {
  it("should have all expected status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.ACCEPTED).toBe(202);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe("buildAudioUrl", () => {
  it("should construct correct S3 URL", () => {
    const url = buildAudioUrl("abc123");
    expect(url).toContain("abc123.wav");
    expect(url).toContain(".s3.");
    expect(url).toContain(".amazonaws.com/cache/");
  });
});

describe("buildCacheKey", () => {
  it("should return cache path with .wav extension", () => {
    expect(buildCacheKey("abc123")).toBe("cache/abc123.wav");
  });

  it("should include the cacheKey in the path", () => {
    const key = buildCacheKey("test-key");
    expect(key).toContain("test-key");
    expect(key).toMatch(/^cache\/.+\.wav$/);
  });
});

describe("resetRateLimit", () => {
  it("should be callable without error", () => {
    expect(() => resetRateLimit()).not.toThrow();
  });
});

describe("SynthesizeRequest", () => {
  it("should allow minimal request with just text", () => {
    const req: SynthesizeRequest = { text: "hello" };
    expect(req.text).toBe("hello");
    expect(req.voice).toBeUndefined();
  });

  it("should allow full request with all fields", () => {
    const req: SynthesizeRequest = {
      text: "hello",
      voice: "efm_l",
      speed: 1.5,
      pitch: 2,
    };
    expect(req.voice).toBe("efm_l");
    expect(req.speed).toBe(1.5);
  });
});

describe("VOICE_DEFAULTS", () => {
  it("should have expected default values", () => {
    expect(VOICE_DEFAULTS.voice).toBe("efm_l");
    expect(VOICE_DEFAULTS.speed).toBe(1.0);
    expect(VOICE_DEFAULTS.pitch).toBe(0);
  });
});
