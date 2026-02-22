// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  generateCacheKey,
  parseRequestBody,
  applySynthesizeDefaults,
  MAX_BODY_SIZE,
  health,
  VERSION,
  MAX_TEXT_LENGTH,
  SPEED_RANGE,
  PITCH_RANGE,
  SynthesizeRequestSchema,
  CacheKeySchema,
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
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.text).toBe("hello");
    }
  });

  it("should return empty object for undefined body", () => {
    const result = parseRequestBody(undefined);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toStrictEqual({});
    }
  });

  it("should return error on invalid JSON", () => {
    const result = parseRequestBody("not json");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid JSON body");
    }
  });

  it("should return error on body exceeding MAX_BODY_SIZE", () => {
    const largeBody = "x".repeat(MAX_BODY_SIZE + 1);
    const result = parseRequestBody(largeBody);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Request body too large");
    }
  });

  it("should accept body at MAX_BODY_SIZE", () => {
    const body = JSON.stringify({ text: "a".repeat(MAX_BODY_SIZE - 20) });
    const result = parseRequestBody(body.slice(0, MAX_BODY_SIZE));
    expect(result.ok).toBe(true);
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


describe("createResponse", () => {
  it("should return response with CORS headers", () => {
    const response = createResponse(HTTP_STATUS.OK, { status: "ok" });

    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "null" });
    expect(JSON.parse(response.body)).toStrictEqual({ status: "ok" });
  });
});

describe("createInternalError", () => {
  it("should return 500 with generic error message", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const response = createInternalError("Test context", new Error("fail"));

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(JSON.parse(response.body).error).toBe("Internal server error");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Test context:"), "fail");
    spy.mockRestore();
  });

  it("should handle non-Error values", () => {
    const spy = jest.spyOn(console, "error").mockImplementation();
    const response = createInternalError("Context", "string error");

    expect(response.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("Context:"), "string error");
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

  it("getS3Bucket should throw when unset", () => {
    delete process.env.S3_BUCKET;
    expect(() => getS3Bucket()).toThrow("Invalid or missing S3_BUCKET");
  });

  it("getSqsQueueUrl should throw when unset", () => {
    delete process.env.SQS_QUEUE_URL;
    expect(() => getSqsQueueUrl()).toThrow("Missing required environment variable: SQS_QUEUE_URL");
  });

  it("getEcsCluster should throw when unset", () => {
    delete process.env.ECS_CLUSTER;
    expect(() => getEcsCluster()).toThrow("Missing required environment variable: ECS_CLUSTER");
  });

  it("getEcsService should throw when unset", () => {
    delete process.env.ECS_SERVICE;
    expect(() => getEcsService()).toThrow("Missing required environment variable: ECS_SERVICE");
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
    expect(response.headers).toStrictEqual({ ...CORS_HEADERS, "Access-Control-Allow-Origin": "null" });
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

describe("re-exported schemas", () => {
  it("should re-export schema constants from handler", () => {
    expect(MAX_TEXT_LENGTH).toBeGreaterThan(0);
    expect(SPEED_RANGE).toHaveProperty("min");
    expect(PITCH_RANGE).toHaveProperty("min");
    expect(SynthesizeRequestSchema.safeParse).toBeDefined();
    expect(CacheKeySchema.safeParse).toBeDefined();
  });
});
