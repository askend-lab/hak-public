// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent } from "aws-lambda";
import {
  createResponse,
  handleSave,
  handleGet,
  handleDelete,
  handleQuery,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "../src/lambda/routes";
import { Store, ServerContext } from "../src/core";
import { InMemoryDynamoDB } from "./mockDynamoDB";

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

describe("Routes", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store(new InMemoryDynamoDB(), testContext);
  });

  describe("createResponse", () => {
    it("should create response with correct status and body", () => {
      const response = createResponse(200, { message: "ok" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('{"message":"ok"}');
      expect(response.headers?.["Content-Type"]).toBe("application/json");
      expect(response.headers?.["Access-Control-Allow-Origin"]).toBe("*");
    });

    it("should stringify complex objects", () => {
      const response = createResponse(201, { items: [1, 2, 3], nested: { a: 1 } });
      expect(response.statusCode).toBe(201);
      const parsed = JSON.parse(response.body);
      expect(parsed.items).toStrictEqual([1, 2, 3]);
      expect(parsed.nested.a).toBe(1);
    });
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
        body: JSON.stringify({ pk: "test" }), // missing required fields
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
          pk: "entity1",
          sk: "sort1",
          type: "private",
          ttl: 3600,
          data: { key: "value" },
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeDefined();
      expect(body.item.PK).toBeDefined();
      expect(body.item.SK).toBeDefined();
    });

    it("should save item without data field", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          pk: "entity2",
          sk: "sort2",
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
          pk: "entity3",
          sk: "sort3",
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
        queryStringParameters: { pk: "test", sk: "", type: "invalid" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should return OK with null item for not found", async () => {
      const event = createMockEvent({
        queryStringParameters: { pk: "nonexistent", sk: "sort", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeNull();
    });

    it("should return OK with item when found", async () => {
      // First save an item
      await store.save({
        pk: "get-test",
        sk: "sort1",
        type: "private",
        ttl: 3600,
        data: { key: "value" },
      });

      const event = createMockEvent({
        queryStringParameters: { pk: "get-test", sk: "sort1", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item).toBeDefined();
      expect(body.item.PK).toBeDefined();
    });
  });

  describe("handleDelete", () => {
    it("should return BAD_REQUEST for validation errors", async () => {
      const event = createMockEvent({
        queryStringParameters: { pk: "", sk: "", type: "private" },
      });
      const response = await handleDelete(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should return OK for successful delete", async () => {
      // First save an item
      await store.save({
        pk: "delete-test",
        sk: "sort1",
        type: "private",
        ttl: 3600,
      });

      const event = createMockEvent({
        queryStringParameters: { pk: "delete-test", sk: "sort1", type: "private" },
      });
      const response = await handleDelete(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should return NOT_FOUND for nonexistent item", async () => {
      const event = createMockEvent({
        queryStringParameters: { pk: "nonexistent", sk: "sort", type: "private" },
      });
      const response = await handleDelete(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe("handleQuery", () => {
    it("should return BAD_REQUEST for missing prefix", async () => {
      const event = createMockEvent({
        queryStringParameters: { type: "private" },
      });
      const response = await handleQuery(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
      const body = JSON.parse(response.body);
      expect(body.errors).toContain("prefix is required");
    });

    it("should return BAD_REQUEST for validation errors", async () => {
      const event = createMockEvent({
        queryStringParameters: { prefix: 123 as unknown as string, type: "invalid" },
      });
      const response = await handleQuery(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should return OK with items", async () => {
      // Save some items
      await store.save({ pk: "query-prefix", sk: "sort1", type: "private", ttl: 3600 });
      await store.save({ pk: "query-prefix", sk: "sort2", type: "private", ttl: 3600 });

      const event = createMockEvent({
        queryStringParameters: { prefix: "query-", type: "private" },
      });
      const response = await handleQuery(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.items).toBeDefined();
      expect(Array.isArray(body.items)).toBe(true);
    });

    it("should return OK with empty items for no match", async () => {
      const event = createMockEvent({
        queryStringParameters: { prefix: "nonexistent-", type: "private" },
      });
      const response = await handleQuery(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.items).toStrictEqual([]);
    });
  });

  describe("handleSave data handling", () => {
    it("should save item with data field set", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          pk: "data-test",
          sk: "sort1",
          type: "private",
          ttl: 3600,
          data: { field: "value" },
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item.data).toStrictEqual({ field: "value" });
    });

    it("should save item without data field", async () => {
      const event = createMockEvent({
        body: JSON.stringify({
          pk: "no-data-test",
          sk: "sort1",
          type: "private",
          ttl: 3600,
        }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
    });
  });

  describe("ERROR_STATUS_MAP usage", () => {
    it("should return OK with null item for not found (private)", async () => {
      const event = createMockEvent({
        queryStringParameters: { pk: "nonexistent-private", sk: "sort1", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      expect(JSON.parse(response.body).item).toBeNull();
    });
  });
});
