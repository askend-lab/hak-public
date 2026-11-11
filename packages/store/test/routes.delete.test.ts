// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent } from "aws-lambda";
import { handleSave, handleGet, handleDelete, handleQuery, HTTP_STATUS } from "../src/lambda/routes";
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

describe("routes: delete", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store(new InMemoryAdapter(), testContext);
  });

  describe("handleDelete", () => {
    it("should return BAD_REQUEST for validation errors", async () => {
      const event = createMockEvent({
        queryStringParameters: { key: "", id: "", type: "private" },
      });
      const response = await handleDelete(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it("should return OK for successful delete", async () => {
      await store.save({ key: "delete-test", id: "sort1", type: "private", ttl: 3600 });
      const event = createMockEvent({
        queryStringParameters: { key: "delete-test", id: "sort1", type: "private" },
      });
      const response = await handleDelete(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it("should return NOT_FOUND for nonexistent item", async () => {
      const event = createMockEvent({
        queryStringParameters: { key: "nonexistent", id: "sort", type: "private" },
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
      await store.save({ key: "query-prefix", id: "sort1", type: "private", ttl: 3600 });
      await store.save({ key: "query-prefix", id: "sort2", type: "private", ttl: 3600 });
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
        body: JSON.stringify({ key: "data-test", id: "sort1", type: "private", ttl: 3600, data: { field: "value" } }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      const body = JSON.parse(response.body);
      expect(body.item.data).toStrictEqual({ field: "value" });
    });

    it("should save item without data field", async () => {
      const event = createMockEvent({
        body: JSON.stringify({ key: "no-data-test", id: "sort1", type: "private", ttl: 3600 }),
      });
      const response = await handleSave(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
    });
  });

  describe("ERROR_STATUS_MAP usage", () => {
    it("should return OK with null item for not found (private)", async () => {
      const event = createMockEvent({
        queryStringParameters: { key: "nonexistent-private", id: "sort1", type: "private" },
      });
      const response = await handleGet(event, store);
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
      expect(JSON.parse(response.body).item).toBeNull();
    });
  });
});
