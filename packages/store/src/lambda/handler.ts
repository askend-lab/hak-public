// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Lambda handler - thin as paper
 * Only HTTP concerns, delegates everything to core
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { logger, extractErrorMessage } from "@hak/shared";
import { Store, ServerContext, StorageAdapter } from "../core";
import { InMemoryAdapter, DynamoDBAdapter } from "../adapters";
import {
  handleSave,
  handleGet,
  handleGetPublic,
  handleDelete,
  handleQuery,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "./routes";

const ANONYMOUS_USER = "anonymous";

const ENV = {
  TABLE_NAME: "TABLE_NAME",
  IS_OFFLINE: "IS_OFFLINE",
  APP_NAME: "APP_NAME",
  TENANT: "TENANT",
  ENVIRONMENT: "ENVIRONMENT",
} as const;

function isOfflineMode(): boolean {
  return process.env[ENV.IS_OFFLINE] === "true";
}

const adapterManager = {
  _instance: null as StorageAdapter | null,

  set(adapter: StorageAdapter | null): void {
    this._instance = adapter;
  },

  get(): StorageAdapter {
    if (!this._instance) {
      const tableName = process.env[ENV.TABLE_NAME];
      this._instance = tableName && !isOfflineMode()
        ? new DynamoDBAdapter(tableName)
        : new InMemoryAdapter();
    }
    return this._instance;
  },

  reset(): void {
    this._instance = null;
  },
};

/** Set adapter (for testing or custom adapters) */
export function setAdapter(adapter: StorageAdapter | null): void {
  adapterManager.set(adapter);
}

/**
 * Get user ID from Cognito authorizer claims
 */
function getUserId(event: APIGatewayProxyEvent): string | null {
  const cognitoId = event.requestContext.authorizer?.claims?.sub as
    | string
    | undefined;
  return cognitoId || null;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name]?.trim() || defaultValue;
}

/**
 * Create server context from environment
 */
function createContext(userId: string): ServerContext {
  return {
    app: getEnv(ENV.APP_NAME, "default"),
    tenant: getEnv(ENV.TENANT, "default"),
    env: getEnv(ENV.ENVIRONMENT, "dev"),
    userId,
  };
}

/**
 * Create store instance
 */
function createStore(userId: string): Store {
  return new Store(adapterManager.get(), createContext(userId));
}

const MAX_BODY_SIZE = 400_000;

type RouteHandler = (event: APIGatewayProxyEvent, store: Store) => Promise<APIGatewayProxyResult>;

const routes: { method: string; path: string; handler: RouteHandler }[] = [
  { method: "POST", path: "/save", handler: handleSave },
  { method: "GET", path: "/get", handler: handleGet },
  { method: "GET", path: "/get-shared", handler: handleGet },
  { method: "GET", path: "/get-public", handler: handleGetPublic },
  { method: "DELETE", path: "/delete", handler: handleDelete },
  { method: "GET", path: "/query", handler: handleQuery },
];

const PUBLIC_READABLE_TYPES = new Set(["shared", "unlisted", "public"]);

/**
 * Check if request is for publicly readable data (read-only access allowed without auth)
 */
function isPublicReadableRequest(event: APIGatewayProxyEvent): boolean {
  if (event.httpMethod !== "GET") {return false;}
  if (event.resource === "/get-public") {return true;}

  const type = event.queryStringParameters?.type;
  return type !== undefined && PUBLIC_READABLE_TYPES.has(type);
}

function checkPreconditions(
  event: APIGatewayProxyEvent,
): APIGatewayProxyResult | null {
  if (event.resource === "/health" && event.httpMethod === "GET") {
    return createResponse(HTTP_STATUS.OK, { status: "ok" });
  }
  if (event.body && event.body.length > MAX_BODY_SIZE) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: `Request body too large (max ${MAX_BODY_SIZE} bytes)`,
    });
  }
  return null;
}

function resolveUserId(
  event: APIGatewayProxyEvent,
): string | APIGatewayProxyResult {
  const userId = getUserId(event);
  const isAnonymous = !userId && isPublicReadableRequest(event);
  if (!userId && !isAnonymous) {
    return createResponse(HTTP_STATUS.UNAUTHORIZED, {
      error: HTTP_ERRORS.UNAUTHORIZED,
    });
  }
  return userId || ANONYMOUS_USER;
}

function findRoute(
  event: APIGatewayProxyEvent,
): RouteHandler | APIGatewayProxyResult {
  const route = routes.find(
    (r) => r.method === event.httpMethod && r.path === event.resource,
  );
  if (!route) {
    return createResponse(HTTP_STATUS.NOT_FOUND, {
      error: HTTP_ERRORS.NOT_FOUND,
    });
  }
  return route.handler;
}

async function executeRoute(
  routeHandler: RouteHandler,
  event: APIGatewayProxyEvent,
  userId: string,
): Promise<APIGatewayProxyResult> {
  try {
    return await routeHandler(event, createStore(userId));
  } catch (error) {
    logger.error("[SimpleStore] Handler error", {
      requestId: event.requestContext?.requestId,
      error: extractErrorMessage(error),
    });
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: HTTP_ERRORS.INTERNAL,
    });
  }
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const precondition = checkPreconditions(event);
  if (precondition) {return precondition;}

  const userResult = resolveUserId(event);
  if (typeof userResult !== "string") {return userResult;}

  const routeResult = findRoute(event);
  if (typeof routeResult !== "function") {return routeResult;}

  return executeRoute(routeResult, event, userResult);
}
