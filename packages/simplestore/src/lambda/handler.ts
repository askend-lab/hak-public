// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Lambda handler - thin as paper
 * Only HTTP concerns, delegates everything to core
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { Store, ServerContext, StorageAdapter } from "../core";
import { InMemoryAdapter, DynamoDBAdapter } from "../adapters";
import {
  handleSave,
  handleGet,
  handleGetPublic,
  handleDelete,
  handleQuery,
  handleDebugError,
  createResponse,
  HTTP_STATUS,
  HTTP_ERRORS,
} from "./routes";

/** Shared adapter instance for persistence across calls */
let sharedAdapter: StorageAdapter | null = null;

/** Set adapter (for testing or custom adapters) */
export function setAdapter(adapter: StorageAdapter | null): void {
  sharedAdapter = adapter;
}

/** Get or create adapter */
function getAdapter(): StorageAdapter {
  if (!sharedAdapter) {
    const tableName = process.env.TABLE_NAME;
    const isOffline = process.env.IS_OFFLINE === "true";

    if (tableName && !isOffline) {
      // Production: use DynamoDB
      sharedAdapter = new DynamoDBAdapter(tableName);
    } else {
      // Local/test: use in-memory
      sharedAdapter = new InMemoryAdapter();
    }
  }
  return sharedAdapter;
}

/**
 * Get user ID from Cognito claims or local header
 */
function getUserId(event: APIGatewayProxyEvent): string | null {
  const cognitoId = event.requestContext.authorizer?.claims?.sub as
    | string
    | undefined;
  if (cognitoId !== undefined && cognitoId !== "") return cognitoId;

  // In offline/test mode, allow X-User-Id header for testing
  if (process.env.IS_OFFLINE === "true") {
    const localUserId =
      event.headers["X-User-Id"] ?? event.headers["x-user-id"];
    if (localUserId) return localUserId;
  }

  return null;
}

function getEnv(name: string, defaultValue: string): string {
  return process.env[name]?.trim() || defaultValue;
}

/**
 * Create server context from environment
 */
function createContext(userId: string): ServerContext {
  return {
    app: getEnv("APP_NAME", "default"),
    tenant: getEnv("TENANT", "default"),
    env: getEnv("ENVIRONMENT", "dev"),
    userId,
  };
}

/**
 * Create store instance
 */
function createStore(userId: string): Store {
  return new Store(getAdapter(), createContext(userId));
}

interface Route {
  method: string;
  path: string;
  handler: (
    event: APIGatewayProxyEvent,
    store: Store,
  ) => Promise<APIGatewayProxyResult>;
}

const routes: Route[] = [
  { method: "POST", path: "/save", handler: handleSave },
  { method: "GET", path: "/get", handler: handleGet },
  { method: "GET", path: "/get-shared", handler: handleGet },
  { method: "GET", path: "/get-public", handler: handleGetPublic },
  { method: "DELETE", path: "/delete", handler: handleDelete },
  { method: "GET", path: "/query", handler: handleQuery },
];

// #6 Set for O(1) lookup instead of triple OR
const PUBLIC_READABLE_TYPES = new Set(["shared", "unlisted", "public"]);

/**
 * Check if request is for publicly readable data (read-only access allowed without auth)
 */
function isPublicReadableRequest(event: APIGatewayProxyEvent): boolean {
  if (event.httpMethod !== "GET") return false;
  if (event.resource === "/get-public") return true;

  const type = event.queryStringParameters?.type;
  return type !== undefined && PUBLIC_READABLE_TYPES.has(type);
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  // Debug endpoint - no auth required
  if (event.httpMethod === "POST" && event.resource === "/debug/error") {
    return handleDebugError();
  }

  const userId = getUserId(event);

  // Allow unauthenticated GET requests for shared data
  const isAnonymousSharedAccess = !userId && isPublicReadableRequest(event);

  if (!userId && !isAnonymousSharedAccess) {
    return createResponse(HTTP_STATUS.UNAUTHORIZED, {
      error:
        "Authentication required. Provide a valid token or use a public-readable endpoint.",
    });
  }

  // Use event.resource (API Gateway resource path) instead of event.path (which includes basePath)
  const route = routes.find(
    (r) => r.method === event.httpMethod && r.path === event.resource,
  );
  if (!route) {
    return createResponse(HTTP_STATUS.NOT_FOUND, {
      error: HTTP_ERRORS.NOT_FOUND,
    });
  }

  try {
    // For anonymous shared access, use 'anonymous' as userId
    const effectiveUserId = userId || "anonymous";
    return await route.handler(event, createStore(effectiveUserId));
  } catch {
    return createResponse(HTTP_STATUS.INTERNAL_ERROR, {
      error: HTTP_ERRORS.INTERNAL,
    });
  }
}
