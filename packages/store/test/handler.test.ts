// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler } from "../src/lambda/handler";
import { Store } from "../src/core/store";
import { InMemoryAdapter } from "../src/adapters/memory";

import {
  createEvent,
  createEventWithAuth,
  createGetEvent,
  createPostEvent,
  createDeleteEvent,
} from "./setup";

describe("handler.test", () => {
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

  describe("health endpoint", () => {
    it("should return 200 with status ok", async () => {
      const event = createGetEvent("/health", null);
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toStrictEqual({ status: "ok" });
    });
  });

  describe("body size limit", () => {
    it("should return 400 for oversized body", async () => {
      const largeBody = "x".repeat(400_001);
      const event = createPostEvent("/save", largeBody);
      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toMatch(/too large/);
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
        id: "sort",
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
        id: "sort",
        type: "public",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should return 200 with null item when item not found", async () => {
      const event = createGetEvent("/get", {
        key: "nonexistent",
        id: "nothere",
        type: "private",
      });
      const result = await handler(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.item).toBeNull();
    });
  });

});
