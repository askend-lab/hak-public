// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Integration tests - testing full pipeline through Lambda handler
 * Tests all 4 data types with proper validation
 */

import { handler } from "../src/lambda/handler";
import { createPostEvent, createGetEvent } from "./setup";

// Helper to set Cognito authorizer claims for auth
function withCognitoUser(
  event: ReturnType<typeof createPostEvent>,
  userId: string,
): ReturnType<typeof createPostEvent> {
  event.requestContext = {
    ...event.requestContext,
    authorizer: { claims: { sub: userId } },
  };
  return event;
}

describe("integration.test", () => {
  describe("private type through handler", () => {
    it("should save and retrieve private item", async () => {
      const saveEvent = withCognitoUser(
        createPostEvent("/save", {
          key: "integration-test",
          id: "private-item",
          type: "private",
          ttl: 3600,
          data: { secret: "value" },
        }),
        "user-owner",
      );

      const saveResult = await handler(saveEvent);
      expect(saveResult.statusCode).toBe(200);

      const getEvent = withCognitoUser(
        createGetEvent("/get", {
          key: "integration-test",
          id: "private-item",
          type: "private",
        }),
        "user-owner",
      );

      const getResult = await handler(getEvent);
      expect(getResult.statusCode).toBe(200);
      expect(JSON.parse(getResult.body).item.data).toStrictEqual({
        secret: "value",
      });
    });

    it("should reject invalid type in request", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "test",
          id: "test",
          type: "invalid-type",
          ttl: 3600,
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).errors).toBeDefined();
    });
  });

  describe("unlisted type through handler", () => {
    it("should save unlisted item", async () => {
      const saveEvent = withCognitoUser(
        createPostEvent("/save", {
          key: "shared-doc",
          id: "doc1",
          type: "unlisted",
          ttl: 3600,
          data: { content: "hello" },
        }),
        "owner-user",
      );

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it("should validate unlisted type is accepted", async () => {
      const getEvent = withCognitoUser(
        createGetEvent("/get", {
          key: "shared-doc",
          id: "doc1",
          type: "unlisted",
        }),
        "any-user",
      );

      const result = await handler(getEvent);
      // Should be 200 or 404, not 400 (type is valid)
      expect([200, 404]).toContain(result.statusCode);
    });
  });

  describe("public type through handler", () => {
    it("should save public item", async () => {
      const saveEvent = withCognitoUser(
        createPostEvent("/save", {
          key: "article",
          id: "post1",
          type: "public",
          ttl: 3600,
          data: { title: "Hello" },
        }),
        "author",
      );

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it("should query public items", async () => {
      const queryEvent = withCognitoUser(
        createGetEvent("/query", {
          prefix: "article",
          type: "public",
        }),
        "reader",
      );

      const result = await handler(queryEvent);
      expect(result.statusCode).toBe(200);
    });
  });

  describe("shared type through handler", () => {
    it("should save shared item", async () => {
      const saveEvent = withCognitoUser(
        createPostEvent("/save", {
          key: "wiki",
          id: "page1",
          type: "shared",
          ttl: 3600,
          data: { content: "Initial" },
        }),
        "user1",
      );

      const result = await handler(saveEvent);
      expect(result.statusCode).toBe(200);
    });

    it("should validate shared type is accepted", async () => {
      const getEvent = withCognitoUser(
        createGetEvent("/get", {
          key: "wiki",
          id: "page1",
          type: "shared",
        }),
        "user2",
      );

      const result = await handler(getEvent);
      expect([200, 404]).toContain(result.statusCode);
    });
  });

});
