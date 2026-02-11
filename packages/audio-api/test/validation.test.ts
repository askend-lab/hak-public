// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler } from "../src/handler";

import {
  TestContext,
  createTestContext,
  setupTestEnv,
  createRequestEvent,
} from "./setup";

describe("Input Validation", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  it("should reject empty text", async () => {
    const event = createRequestEvent("");

    const response = await handler(event, ctx.mockS3, ctx.mockSQS);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe("Text field is required");
  });

  it("should reject missing text field", async () => {
    const event = { body: JSON.stringify({}) };

    const response = await handler(event, ctx.mockS3, ctx.mockSQS);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
  });

  it("should accept text at exactly max length (1000)", async () => {
    const event = createRequestEvent("a".repeat(1000));
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    expect(response.statusCode).toBe(200);
  });

  it("should reject text longer than max length (1001)", async () => {
    const event = createRequestEvent("a".repeat(1001));
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain("too long");
  });

  it("should reject non-string text (number)", async () => {
    const event = { body: JSON.stringify({ text: 123 }) };
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    expect(response.statusCode).toBe(400);
  });

  it("should reject non-string text (null)", async () => {
    const event = { body: JSON.stringify({ text: null }) };
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    expect(response.statusCode).toBe(400);
  });
});
