// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent } from "aws-lambda";
import { handleSave, handleGet, HTTP_STATUS, HTTP_ERRORS } from "../src/lambda/routes";
import { Store, ServerContext } from "../src/core";
import { InMemoryAdapter } from "../src/adapters/memory";

const testContext: ServerContext = {
  app: "test",
  tenant: "test",
  env: "dev",
  userId: "test-user-id",
};

function createMockEvent(
  overrides: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: "123456789012",
      apiId: "test-api",
      authorizer: { claims: { sub: "test-user-id" } },
      protocol: "HTTP/1.1",
      httpMethod: "GET",
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: "127.0.0.1",
        user: null,
        userAgent: "test",
        userArn: null,
      },
      path: "/",
      stage: "test",
      requestId: "test-request-id",
      requestTimeEpoch: Date.now(),
      resourceId: "test-resource",
      resourcePath: "/",
    },
    resource: "/",
    ...overrides,
  };
}

describe("routes.test", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store(new InMemoryAdapter(), testContext);
  });

  describe("handleSave", () => {
    it("should return BAD_REQUEST for null body", async () => {
      const event = createMockEvent({ body: null });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.error).toBe(HTTP_ERRORS.INVALID_JSON);
    });

    it("should return BAD_REQUEST for invalid JSON", async () => {
      const event = createMockEvent({ body: "not json {" });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.error).toBe(HTTP_ERRORS.INVALID_JSON);
    });

    it("should return BAD_REQUEST for validation errors", async () => {
      const event = createMockEvent({
        body: JSON.stringify({ key: "test" }), // missing required fields
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it("should save item and return OK", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          key: "entity1",
          id: "sort1",
          type: "private",
          ttl: 3600,
          data: { key: "value" },
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeDefined();
      expect(body.item.data).toStrictEqual({ key: "value" });
      expect(body.item.createdAt).toBeDefined();
      expect(body.item.updatedAt).toBeDefined();
      expect(body.item.PK).toBeUndefined();
      expect(body.item.SK).toBeUndefined();
      expect(body.item.owner).toBeUndefined();
      expect(body.item.version).toBeUndefined();
    });

    it("should save item without data field", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          key: "entity2",
          id: "sort2",
          type: "private",
          ttl: 3600,
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeDefined();
    });

    it("should save item with explicit undefined data", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          key: "entity3",
          id: "sort3",
          type: "public",
          ttl: 0,
          data: undefined,
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
    });
  });

  describe("handleGet", () => {
    it("should return BAD_REQUEST for missing parameters", async () => {
      const event = createMockEvent({ queryStringParameters: null });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.errors).toBeDefined();
    });

    it("should return BAD_REQUEST for validation errors", async () => {
      const event = createMockEvent({
        queryStringParameters: { key: "test", id: "", type: "invalid" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should return OK with null item for not found", async () => {
      const event = createMockEvent({
        queryStringParameters: { key: "nonexistent", id: "sort", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeNull();
    });

    it("should return OK with item when found", async () => {
      // First save an item
      await store.save({
        key: "get-test",
        id: "sort1",
        type: "private",
        ttl: 3600,
        data: { key: "value" },
      });

      const event = createMockEvent({
        queryStringParameters: { key: "get-test", id: "sort1", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeDefined();
      expect(body.item.data).toStrictEqual({ key: "value" });
      expect(body.item.createdAt).toBeDefined();
      expect(body.item.PK).toBeUndefined();
      expect(body.item.owner).toBeUndefined();
    });
  });

});
