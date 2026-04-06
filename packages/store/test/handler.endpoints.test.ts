// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler } from "../src/lambda/handler";

import { createEvent, createGetEvent, createPostEvent } from "./setup";

describe("handler: endpoints", () => {
  describe("query endpoint success path", () => {
    it("should return 200 with valid params", async () => {
      const event = createGetEvent("/query", {
        prefix: "test-",
        type: "public",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toHaveProperty("items");
    });

    it("should handle null queryStringParameters", async () => {
      const event = createGetEvent("/query", null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it("should return 400 for missing prefix", async () => {
      const event = createGetEvent("/query", { type: "public" });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toHaveProperty("errors");
    });
  });

  describe("save endpoint validation", () => {
    it("should return 400 for validation errors", async () => {
      const event = createPostEvent("/save", { key: "test" });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it("should return 200 for valid save request", async () => {
      const event = createPostEvent("/save", {
        key: "test",
        id: "sort",
        type: "public",
        ttl: 3600,
        data: { key: "value" },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toHaveProperty("item");
    });
  });

  describe("response structure", () => {
    it("should include error field in validation errors", async () => {
      const event = createPostEvent("/save", { key: "test" });
      const result = await handler(event);
      const body = JSON.parse(result.body);
      expect(body.errors).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    it("should return items array for query", async () => {
      const event = createGetEvent("/query", {
        prefix: "test-",
        type: "public",
      });
      const result = await handler(event);
      const body = JSON.parse(result.body);
      expect(body.items).toBeDefined();
      expect(Array.isArray(body.items)).toBe(true);
    });
  });

  describe("Cognito authorizer claims handling", () => {
    it("should authenticate via Cognito claims sub", async () => {
      const event = createEvent({
        httpMethod: "POST",
        path: "/save",
        resource: "/save",
        body: JSON.stringify({ key: "test", id: "sort", type: "private", ttl: 3600, data: {} }),
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: { claims: { sub: "cognito-user-123" } },
        },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should reject when no authorizer claims present", async () => {
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", id: "sort", type: "private" },
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: null,
        },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it("should reject empty string cognito ID", async () => {
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", id: "sort", type: "private" },
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: { claims: { sub: "" } },
        },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it("should ignore X-User-Id header (no fallback to test headers)", async () => {
      process.env.IS_OFFLINE = "true";
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", id: "sort", type: "private" },
        headers: { "X-User-Id": "should-be-ignored" },
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: null,
        },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });
  });

  describe("environment variable handling", () => {
    it("should use default when env var is whitespace only", async () => {
      process.env.APP_NAME = "   ";
      process.env.TENANT = "\t";
      process.env.ENVIRONMENT = "";
      const event = createPostEvent("/save", {
        key: "env-test",
        id: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should use actual value when env var is set", async () => {
      process.env.APP_NAME = "myapp";
      process.env.TENANT = "mytenant";
      process.env.ENVIRONMENT = "prod";
      const event = createPostEvent("/save", {
        key: "env-test2",
        id: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });

});
