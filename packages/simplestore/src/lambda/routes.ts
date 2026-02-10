// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * HTTP routes - pure HTTP mapping to Store operations
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import {
  Store,
  DataType,
  StoreRequest,
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  ERRORS,
} from "../core";

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export const HTTP_ERRORS = {
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Not found",
  INTERNAL: "Internal server error",
  INVALID_JSON: "Invalid JSON body",
} as const;

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERRORS.NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERRORS.ACCESS_DENIED]: HTTP_STATUS.FORBIDDEN,
};

export function createResponse(
  statusCode: number,
  body: unknown,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function createErrorResponse(
  error: string | undefined,
  defaultStatus: number,
): APIGatewayProxyResult {
  const status = error
    ? (ERROR_STATUS_MAP[error] ?? defaultStatus)
    : defaultStatus;
  return createResponse(status, { error });
}

function parseBody(
  event: APIGatewayProxyEvent,
): Record<string, unknown> | null {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleSave(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const body = parseBody(event);
  if (!body) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: HTTP_ERRORS.INVALID_JSON,
    });
  }

  const validation = validateStoreRequest(body as Partial<StoreRequest>);
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }

  const request: StoreRequest = {
    pk: body.pk as string,
    sk: body.sk as string,
    type: body.type as DataType,
    ttl: body.ttl as number,
    ...(body.data !== undefined && {
      data: body.data as Record<string, unknown>,
    }),
  };

  const result = await store.save(request);
  return result.success
    ? createResponse(HTTP_STATUS.OK, { item: result.item })
    : createErrorResponse(result.error, HTTP_STATUS.BAD_REQUEST);
}

export async function handleGet(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { pk, sk, type } = event.queryStringParameters ?? {};

  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }

  const result = await store.get(pk as string, sk as string, type as DataType);

  // Always return 200 - null item means not found
  // This prevents CloudFront from transforming 404 to SPA fallback HTML
  if (result.success) {
    return createResponse(HTTP_STATUS.OK, { item: result.item });
  }

  // Not found is a valid result - return 200 with null item
  if (result.error === ERRORS.NOT_FOUND) {
    return createResponse(HTTP_STATUS.OK, { item: null });
  }

  // Other errors (access denied, etc.) still return appropriate status
  return createErrorResponse(result.error, HTTP_STATUS.FORBIDDEN);
}

export async function handleDelete(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { pk, sk, type } = event.queryStringParameters ?? {};

  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }

  const result = await store.delete(
    pk as string,
    sk as string,
    type as DataType,
  );
  return result.success
    ? createResponse(HTTP_STATUS.OK, { success: true })
    : createErrorResponse(result.error, HTTP_STATUS.NOT_FOUND);
}

export async function handleQuery(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { prefix, type } = event.queryStringParameters ?? {};

  const validation = validateQueryRequest(prefix, type);
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }

  if (prefix === undefined) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: "Missing prefix parameter",
    });
  }

  const result = await store.query(prefix, type as DataType);
  return result.success
    ? createResponse(HTTP_STATUS.OK, { items: result.items })
    : createErrorResponse(result.error, HTTP_STATUS.INTERNAL_ERROR);
}

export async function handleDebugError(): Promise<APIGatewayProxyResult> {
  console.error("[DEBUG] Intentional 500 error triggered for monitoring test");
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, {
    error: "Intentional test error for monitoring",
    timestamp: new Date().toISOString(),
  });
}

export async function handleGetPublic(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { pk, sk, type } = event.queryStringParameters ?? {};

  const validation = validateGetRequest(pk, sk, type);
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }

  // Reject private type - this endpoint is only for public-readable data
  if (type === "private") {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: "private type not allowed on /get-public endpoint",
    });
  }

  const result = await store.get(pk as string, sk as string, type as DataType);

  if (result.success) {
    return createResponse(HTTP_STATUS.OK, { item: result.item });
  }

  if (result.error === ERRORS.NOT_FOUND) {
    return createResponse(HTTP_STATUS.OK, { item: null });
  }

  return createErrorResponse(result.error, HTTP_STATUS.FORBIDDEN);
}
