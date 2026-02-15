// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  generateCacheKey,
  resetRateLimit,
  parseRequestBody,
  applySynthesizeDefaults,
  validateText,
  validateParams,
  MAX_BODY_SIZE,
  health,
  VERSION,
} from "../src/handler";
import type { SynthesizeRequest } from "../src/handler";
import { createResponse, createBadRequest, createInternalError, HTTP_STATUS, CORS_HEADERS } from "../src/response";
import { buildAudioUrl, buildCacheKey } from "../src/s3";
import { isNotFoundError } from "../src/s3";
import { VOICE_DEFAULTS, getAwsRegion, getS3Bucket, getSqsQueueUrl, getEcsCluster, getEcsService } from "../src/env";
import { isEcsConfigured } from "../src/ecs";
import {
  setupTestEnv,
  TEST_REGION,
  TEST_BUCKET,
  TEST_QUEUE_URL,
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_PITCH,
} from "./setup";

beforeEach(() => {
  setupTestEnv();
});

describe("generateCacheKey", () => {
  it("should return consistent hash for same input", () => {
    const key1 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    const key2 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    expect(key1).toBe(key2);
  });

  it("should return different hash for different text", () => {
    const key1 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    const key2 = generateCacheKey("world", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different voice", () => {
    const key1 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    const key2 = generateCacheKey("hello", "other", DEFAULT_SPEED, DEFAULT_PITCH);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different speed", () => {
    const key1 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    const key2 = generateCacheKey("hello", DEFAULT_VOICE, 1.5, DEFAULT_PITCH);
    expect(key1).not.toBe(key2);
  });

  it("should return different hash for different pitch", () => {
    const key1 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    const key2 = generateCacheKey("hello", DEFAULT_VOICE, DEFAULT_SPEED, 1);
    expect(key1).not.toBe(key2);
  });

  it("should return a 64-char hex string (sha256)", () => {
    const key = generateCacheKey("test", DEFAULT_VOICE, DEFAULT_SPEED, DEFAULT_PITCH);
    expect(key).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("parseRequestBody", () => {
  it("should parse valid JSON body", () => {
    const result = parseRequestBody(JSON.stringify({ text: "hello" }));
    expect(result).not.toBeNull();
    expect(result?.text).toBe("hello");
  });

  it("should return empty object for undefined body", () => {
    const result = parseRequestBody(undefined);
    expect(result).toStrictEqual({});
  });

  it("should return null on invalid JSON", () => {
    expect(parseRequestBody("not json")).toBeNull();
  });

  it("should return null on body exceeding MAX_BODY_SIZE", () => {
    const largeBody = "x".repeat(MAX_BODY_SIZE + 1);
    expect(parseRequestBody(largeBody)).toBeNull();
  });

  it("should accept body at MAX_BODY_SIZE", () => {
    const body = JSON.stringify({ text: "a".repeat(MAX_BODY_SIZE - 20) });
    expect(parseRequestBody(body.slice(0, MAX_BODY_SIZE))).not.toBeNull();
  });
});

describe("applySynthesizeDefaults", () => {
  it("should apply all defaults for minimal request", () => {
    const result = applySynthesizeDefaults({ text: "hello" });
    expect(result).toStrictEqual({
      text: "hello",
      voice: VOICE_DEFAULTS.voice,
      speed: VOICE_DEFAULTS.speed,
      pitch: VOICE_DEFAULTS.pitch,
    });
  });

  it("should preserve provided values", () => {
    const result = applySynthesizeDefaults({
      text: "hello",
      voice: "custom",
      speed: 2.0,
      pitch: 3,
    });
    expect(result).toStrictEqual({
      text: "hello",
      voice: "custom",
      speed: 2.0,
      pitch: 3,
    });
  });
});

describe("validateParams", () => {
  const validParams = { text: "hello", voice: "default", speed: 1.0, pitch: 0 };

  it("should return null for valid params", () => {
    expect(validateParams(validParams)).toBeNull();
  });

  it("should reject speed below minimum", () => {
    expect(validateParams({ ...validParams, speed: 0.1 })).toContain("Speed");
  });

  it("should reject speed above maximum", () => {
    expect(validateParams({ ...validParams, speed: 3.0 })).toContain("Speed");
  });

  it("should reject pitch below minimum", () => {
    expect(validateParams({ ...validParams, pitch: -600 })).toContain("Pitch");
  });

  it("should reject pitch above maximum", () => {
    expect(validateParams({ ...validParams, pitch: 600 })).toContain("Pitch");
  });
});

describe("createResponse", () => {
  it("should return response with CORS headers", () => {
    const response = createResponse(HTTP_STATUS.OK, { status: "ok" });

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "*" });
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

  it("should handle non-Error values", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const response = createInternalError("Context", "string error");

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(spy).toHaveBeenCalledWith("Context:", "string error");
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
  it("should construct correct S3 URL with exact format", () => {
    const url = buildAudioUrl("abc123");
    expect(url).toBe(
      `https://${TEST_BUCKET}.s3.${TEST_REGION}.amazonaws.com/cache/abc123.wav`,
    );
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

describe("isNotFoundError", () => {
  it("should return true for NotFound error", () => {
    expect(isNotFoundError({ name: "NotFound" })).toBe(true);
  });

  it("should return true for NoSuchKey error", () => {
    expect(isNotFoundError({ name: "NoSuchKey" })).toBe(true);
  });

  it("should return true for 404 status code", () => {
    expect(isNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(true);
  });

  it("should return false for other errors", () => {
    expect(isNotFoundError({ name: "AccessDenied" })).toBe(false);
  });

  it("should return false for null", () => {
    expect(isNotFoundError(null)).toBe(false);
  });

  it("should return false for primitives", () => {
    expect(isNotFoundError("error")).toBe(false);
    expect(isNotFoundError(42)).toBe(false);
  });
});

describe("env functions", () => {
  it("getAwsRegion should return env value", () => {
    expect(getAwsRegion()).toBe(TEST_REGION);
  });

  it("getAwsRegion should return default when unset", () => {
    delete process.env.AWS_REGION;
    expect(getAwsRegion()).toBe("eu-west-1");
  });

  it("getS3Bucket should return env value", () => {
    expect(getS3Bucket()).toBe(TEST_BUCKET);
  });

  it("getSqsQueueUrl should return env value", () => {
    expect(getSqsQueueUrl()).toBe(TEST_QUEUE_URL);
  });

  it("getS3Bucket should return empty when unset", () => {
    delete process.env.S3_BUCKET;
    expect(getS3Bucket()).toBe("");
  });

  it("getSqsQueueUrl should return empty when unset", () => {
    delete process.env.SQS_QUEUE_URL;
    expect(getSqsQueueUrl()).toBe("");
  });

  it("getEcsCluster should return empty when unset", () => {
    expect(getEcsCluster()).toBe("");
  });

  it("getEcsService should return empty when unset", () => {
    expect(getEcsService()).toBe("");
  });
});

describe("isEcsConfigured", () => {
  it("should return false when both unset", () => {
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return false when only cluster set", () => {
    process.env.ECS_CLUSTER = "my-cluster";
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return false when only service set", () => {
    process.env.ECS_SERVICE = "my-service";
    expect(isEcsConfigured()).toBe(false);
  });

  it("should return true when both set", () => {
    process.env.ECS_CLUSTER = "my-cluster";
    process.env.ECS_SERVICE = "my-service";
    expect(isEcsConfigured()).toBe(true);
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

describe("validateText", () => {
  it("should return true for valid text", () => {
    expect(validateText("hello")).toBe(true);
  });

  it("should return false for empty string", () => {
    expect(validateText("")).toBe(false);
  });

  it("should return false for non-string", () => {
    expect(validateText(123)).toBe(false);
    expect(validateText(null)).toBe(false);
    expect(validateText(undefined)).toBe(false);
  });
});

describe("createBadRequest", () => {
  it("should return 400 with error message", () => {
    const response = createBadRequest("test error");
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(JSON.parse(response.body).error).toBe("test error");
  });
});

describe("health", () => {
  it("should return OK with version", async () => {
    const response = await health();
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body.version).toBe(VERSION);
  });

  it("should include CORS headers", async () => {
    const response = await health();
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "*" });
  });
});

describe("VERSION", () => {
  it("should be a valid semver string", () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("VOICE_DEFAULTS", () => {
  it("should have expected default values", () => {
    expect(VOICE_DEFAULTS.voice).toBe(DEFAULT_VOICE);
    expect(VOICE_DEFAULTS.speed).toBe(DEFAULT_SPEED);
    expect(VOICE_DEFAULTS.pitch).toBe(DEFAULT_PITCH);
  });
});
