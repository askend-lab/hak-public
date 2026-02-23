// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, setAdapter } from "../src/lambda/handler";
import { createEvent, createPostEvent } from "./setup";

describe("Lambda Handler Auth", () => {
  beforeEach(() => {
    process.env.IS_OFFLINE = "true";
    setAdapter(null);
  });

  describe("X-User-Id edge cases", () => {
    it.each([
      ["not provided, IS_OFFLINE=false", "false", {}, 401],
      ["ignored when IS_OFFLINE=false", "false", { "X-User-Id": "ignored" }, 401],
      ["empty in offline mode", "true", { "X-User-Id": "" }, 401],
    ])("should handle X-User-Id %s", async (_name, offline, headers, expectedStatus) => {
      process.env.IS_OFFLINE = offline;
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { pk: "test", sk: "sort", type: "private" },
        headers,
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(expectedStatus);
    });

    it("should use X-User-Id when provided and IS_OFFLINE is true", async () => {
      const event = createEvent({
        httpMethod: "POST",
        path: "/save",
        resource: "/save",
        body: JSON.stringify({ pk: "x-user-test", sk: "sort1", type: "private", ttl: 3600 }),
        headers: { "X-User-Id": "local-test-user" },
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.item.owner).toBeUndefined();
      expect(body.item.data).toBeDefined();
    });
  });

  describe("shared data access", () => {
    it.each([
      ["shared", "shared-anon"],
      ["unlisted", "unlisted-anon"],
      ["public", "public-anon"],
    ])("should allow anonymous access to %s type on /get", async (type, pk) => {
      const saveEvent = createPostEvent("/save", { pk, sk: "sort1", type, ttl: 3600 });
      await handler(saveEvent);

      const getEvent = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { pk, sk: "sort1", type },
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
        queryStringParameters: { pk: "test", sk: "sort", type: "public" },
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it.each([
      ["private type on /get", "GET", "/get", { pk: "test", sk: "sort", type: "private" }],
      ["POST /save", "POST", "/save", null],
    ])("should reject anonymous %s", async (_name, method, path, params) => {
      const event = createEvent({
        httpMethod: method,
        path,
        resource: path,
        queryStringParameters: params,
        body: method === "POST" ? JSON.stringify({ pk: "test", sk: "sort", type: "public", ttl: 3600 }) : undefined,
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
      const event = createPostEvent("/save", { pk: "env-test", sk: "sort", type: "private", ttl: 3600 });
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
      const event = createPostEvent("/save", { pk: "offline-test", sk: "sort", type: "private", ttl: 3600 });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });
});
