// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler, setAdapter } from "../src/lambda/handler";
import { InMemoryAdapter } from "../src/adapters";
import { APIGatewayProxyEvent } from "aws-lambda";

function createEvent(
  method: string,
  resource: string,
  params?: Record<string, string>,
  body?: object,
  userId?: string,
): APIGatewayProxyEvent {
  return {
    httpMethod: method,
    resource,
    path: resource,
    queryStringParameters: params || null,
    body: body ? JSON.stringify(body) : null,
    headers: {},
    requestContext: {
      authorizer: userId ? { claims: { sub: userId } } : null,
    },
  } as unknown as APIGatewayProxyEvent;
}

describe("/get-public endpoint", () => {
  beforeEach(() => {
    setAdapter(new InMemoryAdapter());
    process.env.IS_OFFLINE = "true";
  });

  describe("allowed types (unlisted, public, shared)", () => {
    it("should allow anonymous GET for unlisted type", async () => {
      // Save unlisted data first (authenticated)
      const saveEvent = createEvent(
        "POST",
        "/save",
        undefined,
        {
          key: "tasks",
          id: "share_token_123",
          type: "unlisted",
          ttl: 3600,
          data: { id: "task-1", name: "Unlisted Task" },
        },
        "user-1",
      );
      await handler(saveEvent);

      // GET via /get-public without auth
      const getEvent = createEvent("GET", "/get-public", {
        key: "tasks",
        id: "share_token_123",
        type: "unlisted",
      }); // No userId - anonymous

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.item?.data?.name).toBe("Unlisted Task");
    });

    it("should allow anonymous GET for public type", async () => {
      const saveEvent = createEvent(
        "POST",
        "/save",
        undefined,
        {
          key: "announcements",
          id: "latest",
          type: "public",
          ttl: 3600,
          data: { message: "Public announcement" },
        },
        "admin-1",
      );
      await handler(saveEvent);

      const getEvent = createEvent("GET", "/get-public", {
        key: "announcements",
        id: "latest",
        type: "public",
      });

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.item?.data?.message).toBe("Public announcement");
    });

    it("should allow anonymous GET for shared type", async () => {
      const saveEvent = createEvent(
        "POST",
        "/save",
        undefined,
        {
          key: "shared",
          id: "tasks",
          type: "shared",
          ttl: 3600,
          data: { tasks: [{ id: "task-1", name: "Shared Task" }] },
        },
        "user-1",
      );
      await handler(saveEvent);

      const getEvent = createEvent("GET", "/get-public", {
        key: "shared",
        id: "tasks",
        type: "shared",
      });

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.item?.data?.tasks).toBeDefined();
    });
  });

  describe("forbidden type (private)", () => {
    it("should reject GET for private type even with authentication", async () => {
      // Save private data
      const saveEvent = createEvent(
        "POST",
        "/save",
        undefined,
        {
          key: "tasks",
          id: "user-1",
          type: "private",
          ttl: 3600,
          data: { tasks: [{ id: "task-1", name: "Private Task" }] },
        },
        "user-1",
      );
      await handler(saveEvent);

      // Try to GET private data via /get-public - should be rejected
      const getEvent = createEvent(
        "GET",
        "/get-public",
        {
          key: "tasks",
          id: "user-1",
          type: "private",
        },
        undefined,
        "user-1",
      ); // Even with auth!

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(400);

      const body = JSON.parse(result.body) as { error?: string };
      expect(body.error).toContain("private");
    });

    it("should reject anonymous GET for private type", async () => {
      const saveEvent = createEvent(
        "POST",
        "/save",
        undefined,
        {
          key: "tasks",
          id: "user-1",
          type: "private",
          ttl: 3600,
          data: { tasks: [{ id: "task-1", name: "Private Task" }] },
        },
        "user-1",
      );
      await handler(saveEvent);

      const getEvent = createEvent("GET", "/get-public", {
        key: "tasks",
        id: "user-1",
        type: "private",
      }); // No auth

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(400);
    });
  });

  describe("validation", () => {
    it("should reject missing type parameter", async () => {
      const getEvent = createEvent("GET", "/get-public", {
        key: "tasks",
        id: "some-key",
        // No type
      });

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(400);
    });

    it("should return null for non-existent data", async () => {
      const getEvent = createEvent("GET", "/get-public", {
        key: "tasks",
        id: "non-existent",
        type: "unlisted",
      });

      const result = await handler(getEvent);
      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.item).toBeNull();
    });
  });
});
