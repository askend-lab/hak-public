// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Integration tests - testing full pipeline through Lambda handler
 * Tests all 4 data types with proper validation
 */

import { handler } from "../src/lambda/handler";
import { createPostEvent } from "./setup";

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

describe("integration: validation", () => {
  describe("validation through handler", () => {
    it("should reject empty pk", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "",
          id: "test",
          type: "public",
          ttl: 3600,
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it("should reject empty sk", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "test",
          id: "",
          type: "public",
          ttl: 3600,
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it("should accept zero ttl (no expiration)", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "test-zero-ttl",
          id: "test",
          type: "public",
          ttl: 0,
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(200);
    });

    it("should reject negative ttl", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "test",
          id: "test",
          type: "public",
          ttl: -1,
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });

    it("should reject ttl exceeding max", async () => {
      const event = withCognitoUser(
        createPostEvent("/save", {
          key: "test",
          id: "test",
          type: "public",
          ttl: 31536001, // 1 year + 1 second
        }),
        "user1",
      );

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
    });
  });

});
