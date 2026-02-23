// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { createApiResponse } from "@hak/shared";

export type { LambdaResponse } from "@hak/shared";
export { CORS_HEADERS, HTTP_STATUS } from "@hak/shared";

export const createResponse = createApiResponse;

export function parseJsonBody(eventBody: string | null): unknown {
  if (eventBody === null) {return null;}

  try {
    return JSON.parse(eventBody);
  } catch {
    return null;
  }
}

export function getFieldError(
  fieldValue: unknown,
  fieldName: string,
  maxLength?: number,
): string | null {
  if (typeof fieldValue !== "string")
    {return `Missing '${fieldName}' field in request body`;}

  if (!fieldValue.trim()) {return `'${fieldName}' must be a non-empty string`;}

  if (maxLength != null && fieldValue.length > maxLength)
    {return `Text is too long (max ${maxLength} characters)`;}
  return null;
}

export function validateField(
  body: Record<string, unknown>,
  fieldName: string,
  maxLength?: number,
): { value: string } | { error: string } {
  const fieldValue = body[fieldName];
  const error = getFieldError(fieldValue, fieldName, maxLength);
  if (error !== null) {return { error };}
  return { value: (fieldValue as string).trim() };
}
