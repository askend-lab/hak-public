// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler } from "../src/handler";
import { buildS3Url } from "../src/s3";

import {
  TestContext,
  createTestContext,
  setupTestEnv,
  setupCache,
  createRequestEvent,
  TEST_BUCKET,
} from "./setup";

describe("Lambda Handler - Cache Hit", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  it("should return URL when file exists in S3", async () => {
    const event = createRequestEvent("tere");
    const hash = setupCache(ctx.mockS3, "tere", true);

    const response = await handler(event, ctx.mockS3, ctx.mockSQS);

    expect(response.statusCode).toBe(200);
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
