// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * HTTP routes - pure HTTP mapping to Store operations
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CORS_HEADERS, HTTP_STATUS } from "@hak/shared";

import {
  Store,
  DataType,
  StoreRequest,
  validateStoreRequest,
  validateGetRequest,
  validateQueryRequest,
  ValidationResult,
  ERRORS,
} from "../core";

export { HTTP_STATUS };

export const HTTP_ERRORS = {
  UNAUTHORIZED: "Authentication required. Provide a valid token or use a public-readable endpoint.",
  NOT_FOUND: "Not found",
  INTERNAL: "Internal server error",
  INVALID_JSON: "Invalid JSON body",
  PRIVATE_NOT_ALLOWED: "private type not allowed on /get-public endpoint",
} as const;

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERRORS.NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERRORS.ACCESS_DENIED]: HTTP_STATUS.FORBIDDEN,
  [ERRORS.VERSION_CONFLICT]: 409,
};

export function createResponse(
  statusCode: number,
  body: unknown,
): APIGatewayProxyResult {
  const origin = process.env.ALLOWED_ORIGIN || CORS_HEADERS["Access-Control-Allow-Origin"];
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Origin": origin ?? "*" },
    body: JSON.stringify(body),
  };
}

function createErrorResponse(
  error: string | undefined,
  fallbackStatus: number,
): APIGatewayProxyResult {
  const status = error
    ? (ERROR_STATUS_MAP[error] ?? fallbackStatus)
    : fallbackStatus;
  return createResponse(status, { error });
}

function getQueryParams(event: APIGatewayProxyEvent): Record<string, string> {
  return (event.queryStringParameters ?? {}) as Record<string, string>;
}

function validateOrError(
  validation: ValidationResult,
): APIGatewayProxyResult | null {
  if (!validation.valid) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    });
  }
  return null;
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

  const validationError = validateOrError(
    validateStoreRequest(body as Partial<StoreRequest>),
  );
  if (validationError) return validationError;

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
  const { pk, sk, type } = getQueryParams(event);

  const validationError = validateOrError(validateGetRequest(pk, sk, type));
  if (validationError) return validationError;

  const result = await store.get(pk as string, sk as string, type as DataType);

  if (result.success) {
    return createResponse(HTTP_STATUS.OK, { item: result.item });
  }

  // Not found is a valid result - return 200 with null item
  // This prevents CloudFront from transforming 404 to SPA fallback HTML
  if (result.error === ERRORS.NOT_FOUND) {
    return createResponse(HTTP_STATUS.OK, { item: null });
  }

  return createErrorResponse(result.error, HTTP_STATUS.FORBIDDEN);
}

export async function handleDelete(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { pk, sk, type } = getQueryParams(event);

  const validationError = validateOrError(validateGetRequest(pk, sk, type));
  if (validationError) return validationError;

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
  const { prefix, type } = getQueryParams(event);

  const validationError = validateOrError(validateQueryRequest(prefix, type));
  if (validationError) return validationError;

  const result = await store.query(prefix as string, type as DataType);
  return result.success
    ? createResponse(HTTP_STATUS.OK, { items: result.items })
    : createErrorResponse(result.error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

export async function handleGetPublic(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { type } = getQueryParams(event);

  if (type === "private") {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: HTTP_ERRORS.PRIVATE_NOT_ALLOWED,
    });
  }

  return handleGet(event, store);
}
