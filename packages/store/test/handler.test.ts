// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, setAdapter } from "../src/lambda/handler";
import { Store } from "../src/core/store";
import { InMemoryAdapter } from "../src/adapters/memory";

import {
  createEvent,
  createEventWithAuth,
  createGetEvent,
  createPostEvent,
  createDeleteEvent,
} from "./setup";

describe("Lambda Handler", () => {
  describe("Store factory", () => {
    it("should create store with adapter and context", () => {
      const adapter = new InMemoryAdapter();
      const store = new Store(adapter, {
        app: "test",
        tenant: "test",
        env: "dev",
        userId: "user123",
      });
      expect(store).toBeDefined();
    });
  });

  describe("authentication", () => {
    it("should return 401 if no user in context", async () => {
      const event = createEventWithAuth({});
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body)).toStrictEqual({
        error:
          "Authentication required. Provide a valid token or use a public-readable endpoint.",
      });
    });

    it("should return 401 if authorizer is null", async () => {
      const event = createEventWithAuth(null);
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it("should return 401 if claims is null", async () => {
      const event = createEventWithAuth({ claims: null });
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });
  });

  describe("routing", () => {
    it("should return 404 for unknown path", async () => {
      const event = createEvent({ path: "/unknown" });

      const result = await handler(event);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Not found" });
    });

    it("should return correct Content-Type header", async () => {
      const event = createEvent({ path: "/unknown" });
      const result = await handler(event);
      expect(result.headers?.["Content-Type"]).toBe("application/json");
      expect(result.headers?.["Access-Control-Allow-Origin"]).toBe("null");
    });
  });

  describe("save endpoint", () => {
    it("should return 400 for invalid JSON", async () => {
      const event = createPostEvent("/save", "invalid json");
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Invalid JSON body" });
    });

    it("should return 400 for missing required fields", async () => {
      const event = createPostEvent("/save", { key: "test" });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).errors).toBeDefined();
    });
  });

  describe("get endpoint", () => {
    it.each([{}, null])(
      "should return 400 for missing/null query params: %j",
      async (params) => {
        const event = createGetEvent("/get", params);
        const result = await handler(event);
        expect(result.statusCode).toBe(400);
      },
    );
  });

  describe("query endpoint", () => {
    it("should return 400 for missing type", async () => {
      const event = createGetEvent("/query", { prefix: "test-" });
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("delete endpoint", () => {
    it.each([{}, null])(
      "should return 400 for missing/null query params: %j",
      async (params) => {
        const event = createDeleteEvent("/delete", params);
        const result = await handler(event);
        expect(result.statusCode).toBe(400);
      },
    );

    it("should return 404 when deleting non-existent item", async () => {
      const event = createDeleteEvent("/delete", {
        key: "test",
        sortKey: "sort",
        type: "public",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toStrictEqual({ error: "Item not found" });
    });
  });

  describe("save endpoint with null body", () => {
    it("should return 400 for null body", async () => {
      const event = createPostEvent("/save", null);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("get endpoint success path", () => {
    it("should return 200 with valid params", async () => {
      const event = createGetEvent("/get", {
        key: "test",
        sortKey: "sort",
        type: "public",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should return 200 with null item when item not found", async () => {
      const event = createGetEvent("/get", {
        key: "nonexistent",
        sortKey: "nothere",
        type: "private",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.item).toBeNull();
    });
  });

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
        sortKey: "sort",
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

  describe("X-User-Id header handling", () => {
    it.each([
      ["X-User-Id", { "X-User-Id": "header-user" }],
      ["x-user-id (lowercase)", { "x-user-id": "header-user-lower" }],
    ])("should use %s header in offline mode", async (_name, headers) => {
      process.env.IS_OFFLINE = "true";
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", sortKey: "sort", type: "private" },
        headers,
        requestContext: { ...createEvent({}).requestContext, authorizer: null },
      });
      const result = await handler(event);
      expect(result.statusCode).not.toBe(401);
    });

    it("should prefer Cognito ID over X-User-Id header", async () => {
      process.env.IS_OFFLINE = "true";
      const event = createEvent({
        httpMethod: "POST",
        path: "/save",
        resource: "/save",
        body: JSON.stringify({ key: "test", sortKey: "sort", type: "private", ttl: 3600, data: {} }),
        headers: { "X-User-Id": "header-user" },
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.item.owner).toBeUndefined();
      expect(body.item.data).toBeDefined();
    });
  });

  describe("empty cognito ID handling", () => {
    it("should reject empty string cognito ID", async () => {
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", sortKey: "sort", type: "private" },
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: { claims: { sub: "" } },
        },
      });
      // With IS_OFFLINE=true and no X-User-Id, should return 401
      process.env.IS_OFFLINE = "false";
      const result = await handler(event);
      expect(result.statusCode).toBe(401);
    });

    it("should fall back to X-User-Id when cognito ID is empty string", async () => {
      process.env.IS_OFFLINE = "true";
      const event = createEvent({
        httpMethod: "GET",
        path: "/get",
        resource: "/get",
        queryStringParameters: { key: "test", sortKey: "sort", type: "private" },
        headers: { "X-User-Id": "fallback-user" },
        requestContext: {
          ...createEvent({}).requestContext,
          authorizer: { claims: { sub: "" } },
        },
      });
      const result = await handler(event);
      expect(result.statusCode).not.toBe(401);
    });
  });

  describe("environment variable handling", () => {
    it("should use default when env var is whitespace only", async () => {
      process.env.APP_NAME = "   ";
      process.env.TENANT = "\t";
      process.env.ENVIRONMENT = "";
      const event = createPostEvent("/save", {
        key: "env-test",
        sortKey: "sort",
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
        sortKey: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });

  describe("adapter selection", () => {
    it("should use InMemory adapter when IS_OFFLINE is true", async () => {
      process.env.IS_OFFLINE = "true";
      process.env.TABLE_NAME = "test-table";
      setAdapter(null); // Reset adapter
      const event = createPostEvent("/save", {
        key: "adapter-test",
        sortKey: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should use InMemory adapter when TABLE_NAME is not set", async () => {
      process.env.IS_OFFLINE = "false";
      delete process.env.TABLE_NAME;
      setAdapter(null);
      const event = createPostEvent("/save", {
        key: "adapter-test2",
        sortKey: "sort",
        type: "private",
        ttl: 3600,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });
  });

  describe("route matching", () => {
    it.each([
      ["unknown routes", "GET", "/unknown", {}, 404],
      ["wrong method on valid path", "PUT", "/save", {}, 404],
    ])("should return %s for %s", async (_name, method, path, params, status) => {
      const event = createEvent({
        httpMethod: method,
        path,
        resource: path,
        queryStringParameters: params,
        body: method === "PUT" ? "{}" : undefined,
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(status);
    });
  });

});
