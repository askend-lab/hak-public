// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, validateText } from "../src/handler";
import { buildS3Url } from "../src/s3";
import { HTTP_STATUS } from "../src/response";

import {
  TestContext,
  createTestContext,
  setupTestEnv,
  setupCache,
  createRequestEvent,
  TEST_BUCKET,
} from "./setup";

describe("handler", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  describe("Cache Hit", () => {
    it("should return URL when file exists in S3", async () => {
      const event = createRequestEvent("tere");
      const hash = setupCache(ctx.mockS3, "tere", true);

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ready");
      expect(body.url).toContain(TEST_BUCKET);
      expect(body.url).toContain(".mp3");
      expect(body.hash).toBe(hash);
    });

    it("should have correct URL format with status ready", async () => {
      const event = createRequestEvent("hello");
      const hash = setupCache(ctx.mockS3, "hello", true);

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      const body = JSON.parse(response.body);
      expect(body.status).toBe("ready");
      expect(body.url).toBe(
        buildS3Url(TEST_BUCKET, process.env.AWS_REGION ?? "eu-west-1", `cache/${hash}.mp3`),
      );
      expect(body.hash).toBe(hash);
    });

    it("should NOT send SQS message on cache hit", async () => {
      const event = createRequestEvent("tere");
      setupCache(ctx.mockS3, "tere", true);

      await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(ctx.mockSQS.messages).toHaveLength(0);
    });
  });

  describe("Cache Miss", () => {
    it("should send SQS message when file not in S3", async () => {
      const event = createRequestEvent("new-phrase");
      const hash = setupCache(ctx.mockS3, "new-phrase", false);

      await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(ctx.mockSQS.messages).toHaveLength(1);
      const messageBody = JSON.parse(ctx.mockSQS.messages[0]?.MessageBody ?? "{}");
      expect(messageBody.text).toBe("new-phrase");
      expect(messageBody.hash).toBe(hash);
    });

    it("should return status processing with hash", async () => {
      const event = createRequestEvent("new-phrase");
      const hash = setupCache(ctx.mockS3, "new-phrase", false);

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("processing");
      expect(body.hash).toBe(hash);
    });

    it("should return hash for frontend polling", async () => {
      const event = createRequestEvent("test");
      const hash = setupCache(ctx.mockS3, "test", false);

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      const body = JSON.parse(response.body);
      expect(body.hash).toBeDefined();
      expect(body.hash).toBe(hash);
      expect(body.url).toBeUndefined();
    });
  });

  describe("Error Cases", () => {
    it("should return error when BUCKET_NAME is missing", async () => {
      delete process.env.BUCKET_NAME;
      const event = createRequestEvent("test");

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("BUCKET_NAME");
    });

    it("should return error when QUEUE_URL is missing", async () => {
      delete process.env.QUEUE_URL;
      const event = createRequestEvent("test");

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("QUEUE_URL");
    });

    it("should return error when both env vars are missing", async () => {
      delete process.env.BUCKET_NAME;
      delete process.env.QUEUE_URL;
      const event = createRequestEvent("test");

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(JSON.parse(response.body).error).toBeDefined();
    });

    it("should handle invalid JSON in request body", async () => {
      const event = { body: "not valid json" };

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should handle S3 errors gracefully", async () => {
      const event = createRequestEvent("test");
      ctx.mockS3.shouldThrow = true;

      const response = await handler(event, ctx.mockS3, ctx.mockSQS);

      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });
  });
});

describe("validateText", () => {
  it("should return valid for normal text", () => {
    const result = validateText("hello");
    expect(result).toStrictEqual({ valid: true, text: "hello" });
  });

  it("should return error for empty string", () => {
    const result = validateText("");
    expect(result).toStrictEqual({ valid: false, error: "Text field is required" });
  });

  it("should return error for non-string", () => {
    const result = validateText(123);
    expect(result).toStrictEqual({ valid: false, error: "Text field is required" });
  });

  it("should return error for text exceeding max length", () => {
    const result = validateText("a".repeat(1001));
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("too long");
    }
  });

  it("should accept text at max length boundary", () => {
    const result = validateText("a".repeat(1000));
    expect(result.valid).toBe(true);
  });
});
