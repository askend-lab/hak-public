// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent } from "aws-lambda";
import { handleGetPublic, HTTP_STATUS } from "../src/lambda/routes";
import { Store, ServerContext } from "../src/core";
import type { DataType } from "../src/core/types";
import { InMemoryDynamoDB } from "./mockDynamoDB";

const testContext: ServerContext = {
  app: "test",
  tenant: "test",
  env: "dev",
  userId: "test-user-id",
};

function createMockEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
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
        accessKey: null, accountId: null, apiKey: null, apiKeyId: null, caller: null,
        clientCert: null, cognitoAuthenticationProvider: null, cognitoAuthenticationType: null,
        cognitoIdentityId: null, cognitoIdentityPoolId: null, principalOrgId: null,
        sourceIp: "127.0.0.1", user: null, userAgent: "test", userArn: null,
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

describe("Routes - handleGetPublic", () => {
  let store: Store;

  beforeEach(() => {
    store = new Store(new InMemoryDynamoDB(), testContext);
  });

  it.each([
    ["private type", { key: "test", sortKey: "sort", type: "private" }, "private type not allowed"],
    ["invalid type", { key: "test", sortKey: "sort", type: "invalid" }, null],
  ])("should return BAD_REQUEST for %s", async (_name, params, expectedError) => {
    const event = createMockEvent({ queryStringParameters: params });
    const response = await handleGetPublic(event, store);
    expect(response.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    const body = JSON.parse(response.body);
    if (expectedError) {
      expect(body.error).toContain(expectedError);
    } else {
      expect(body.errors || body.error).toBeDefined();
    }
  });

  it("should return OK with null for not found public item", async () => {
    const event = createMockEvent({
      queryStringParameters: { key: "nonexistent", sortKey: "sort", type: "public" },
    });
    const response = await handleGetPublic(event, store);
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    expect(JSON.parse(response.body).item).toBeNull();
  });

  it.each([
    ["unlisted", "unlisted-test"],
    ["shared", "shared-test"],
    ["public", "public-test"],
  ])("should return OK for %s type", async (type, keyValue) => {
    await store.save({ key: keyValue, sortKey: "sort1", type: type as DataType, ttl: 3600, data: { test: true } });
    const event = createMockEvent({
      queryStringParameters: { key: keyValue, sortKey: "sort1", type },
    });
    const response = await handleGetPublic(event, store);
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    const body = JSON.parse(response.body);
    expect(body.item).toBeDefined();
    expect(body.item.data.test).toBe(true);
  });

  it("should return item (not null) when public item exists", async () => {
    await store.save({ key: "exists-public", sortKey: "sort1", type: "public", ttl: 3600, data: { found: true } });
    const event = createMockEvent({
      queryStringParameters: { key: "exists-public", sortKey: "sort1", type: "public" },
    });
    const response = await handleGetPublic(event, store);
    expect(response.statusCode).toBe(HTTP_STATUS.OK);
    const body = JSON.parse(response.body);
    expect(body.item).not.toBeNull();
    expect(body.item.data.found).toBe(true);
  });
});
