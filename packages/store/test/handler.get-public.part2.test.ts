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

describe("handler.get-public.test", () => {
  beforeEach(() => {
    setAdapter(new InMemoryAdapter());
    process.env.IS_OFFLINE = "true";
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
