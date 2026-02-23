// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * HTTP routes - pure HTTP mapping to Store operations
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CORS_HEADERS, HTTP_STATUS, getCorsOrigin } from "@hak/shared";

import {
  Store,
  DataType,
  StoreRequest,
  StoreItem,
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

interface ClientItem {
  readonly data: Record<string, unknown>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function toClientItem(item: StoreItem): ClientItem {
  return {
    data: item.data,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERRORS.NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ERRORS.ACCESS_DENIED]: HTTP_STATUS.FORBIDDEN,
  [ERRORS.VERSION_CONFLICT]: 409,
};

export function createResponse(
  statusCode: number,
  body: unknown,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Origin": getCorsOrigin() },
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
  const raw = event.queryStringParameters ?? {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined) {result[key] = value;}
  }
  return result;
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
  if (!event.body) {return null;}
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
  if (validationError) {return validationError;}

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
  if (!result.success || !result.item) {
    return createErrorResponse(result.error, HTTP_STATUS.BAD_REQUEST);
  }
  return createResponse(HTTP_STATUS.OK, { item: toClientItem(result.item) });
}

export async function handleGet(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { pk, sk, type } = getQueryParams(event);

  const validationError = validateOrError(validateGetRequest(pk, sk, type));
  if (validationError) {return validationError;}

  const result = await store.get(pk as string, sk as string, type as DataType);

  if (result.success && result.item) {
    return createResponse(HTTP_STATUS.OK, { item: toClientItem(result.item) });
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
  if (validationError) {return validationError;}

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
  if (validationError) {return validationError;}

  const result = await store.query(prefix as string, type as DataType);
  return result.success
    ? createResponse(HTTP_STATUS.OK, { items: (result.items ?? []).map(toClientItem) })
    : createErrorResponse(result.error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

const PUBLIC_ALLOWED_TYPES = new Set(["shared", "unlisted", "public"]);

export async function handleGetPublic(
  event: APIGatewayProxyEvent,
  store: Store,
): Promise<APIGatewayProxyResult> {
  const { type } = getQueryParams(event);

  if (!type || !PUBLIC_ALLOWED_TYPES.has(type)) {
    return createResponse(HTTP_STATUS.BAD_REQUEST, {
      error: HTTP_ERRORS.PRIVATE_NOT_ALLOWED,
    });
  }

  return handleGet(event, store);
}
