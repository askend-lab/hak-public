// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, setAdapter } from "../src/lambda/handler";
import { createEvent, createPostEvent } from "./setup";

describe("Lambda Handler Auth", () => {
  beforeEach(() => {
    process.env.IS_OFFLINE = "true";
    setAdapter(null);
  });

  describe("Cognito authorizer edge cases", () => {
    it("should reject when X-User-Id header is provided but no Cognito claims", async () => {
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", id: "sort", type: "private" },
        headers: { "X-User-Id": "should-be-ignored" },
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it("should authenticate when Cognito claims sub is present", async () => {
      const event = createEvent({
        httpMethod: "POST",
        path: "/save",
        resource: "/save",
        body: JSON.stringify({ key: "cognito-test", id: "sort1", type: "private", ttl: 3600 }),
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: { claims: { sub: "cognito-user-abc" } },
        },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });

  describe("shared data access", () => {
    it.each([
      ["shared", "shared-anon"],
      ["unlisted", "unlisted-anon"],
      ["public", "public-anon"],
    ])("should allow anonymous access to %s type on /get", async (type, keyValue) => {
      const saveEvent = createPostEvent("/save", { key: keyValue, id: "sort1", type, ttl: 3600 });
      await handler(saveEvent);

      const getEvent = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: keyValue, id: "sort1", type },
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(getEvent);
      expect(result.statusCode).toBe(200);
    });

    it("should allow anonymous access to /get-public endpoint", async () => {
      const event = createEvent({
        httpMethod: "GET",
        path: "/get-public",
        resource: "/get-public",
        queryStringParameters: { key: "test", id: "sort", type: "public" },
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it.each([
      ["private type on /get", "GET", "/get", { key: "test", id: "sort", type: "private" }],
      ["POST /save", "POST", "/save", null],
    ])("should reject anonymous %s", async (_name, method, path, params) => {
      const event = createEvent({
        httpMethod: method,
        path,
        resource: path,
        queryStringParameters: params,
        body: method === "POST" ? JSON.stringify({ key: "test", id: "sort", type: "public", ttl: 3600 }) : undefined,
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });
  });

  describe("environment variable behavior", () => {
    it.each([
      ["undefined env vars", { APP_NAME: undefined, TENANT: undefined, ENVIRONMENT: undefined }],
      ["empty string env vars", { APP_NAME: "", TENANT: "", ENVIRONMENT: "" }],
      ["non-empty env vars", { APP_NAME: "customapp", TENANT: "customtenant", ENVIRONMENT: "production" }],
      ["whitespace-only env var", { APP_NAME: "  \t  " }],
    ])("should handle %s correctly", async (_name, envVars) => {
      Object.entries(envVars).forEach(([key, value]) => {
        if (value === undefined) {delete process.env[key];}
        else {process.env[key] = value;}
      });
      const event = createPostEvent("/save", { key: "env-test", id: "sort", type: "private", ttl: 3600 });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it.each([
      ["IS_OFFLINE=true", "true"],
      ["IS_OFFLINE=TRUE", "TRUE"],
      ["IS_OFFLINE=false", "false"],
    ])("should handle %s", async (_name, value) => {
      process.env.IS_OFFLINE = value;
      delete process.env.TABLE_NAME;
      setAdapter(null);
      const event = createPostEvent("/save", { key: "offline-test", id: "sort", type: "private", ttl: 3600 });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });
});
