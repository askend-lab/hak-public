// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export function createResponse(
  statusCode: number,
  body: object,
): LambdaResponse {
  return {
    statusCode,
    headers: { ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export function parseJsonBody(eventBody: string | null): unknown {
  if (eventBody === null) return null;

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
    return `Missing '${fieldName}' field in request body`;

  if (!fieldValue.trim()) return `'${fieldName}' must be a non-empty string`;

  if (maxLength != null && fieldValue.length > maxLength)
    return `Text is too long (max ${maxLength} characters)`;
  return null;
}

export function validateField(
  body: Record<string, unknown>,
  fieldName: string,
  maxLength?: number,
): { value: string } | { error: string } {
  const fieldValue = body[fieldName];
  const error = getFieldError(fieldValue, fieldName, maxLength);
  if (error !== null) return { error };
  return { value: (fieldValue as string).trim() };
}
