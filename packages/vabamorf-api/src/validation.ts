// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { LambdaResponse } from "./types";
import { initVmetajson, isInitialized } from "./vmetajson";

// Stryker disable next-line all: env defaults are equivalent
const VMETAJSON_PATH = process.env.VMETAJSON_PATH ?? "./vmetajson";

// Stryker disable next-line all: env defaults are equivalent
const DICT_PATH = process.env.DICT_PATH ?? ".";

const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
} as const;

export function createResponse(
  statusCode: number,
  body: object,
): LambdaResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: RESPONSE_HEADERS,
  };
}

export function ensureInitialized(): void {
  if (!isInitialized()) initVmetajson(VMETAJSON_PATH, DICT_PATH);
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
  const error = getFieldError(body[fieldName], fieldName, maxLength);
  if (error !== null) return { error };
  return { value: (body[fieldName] as string).trim() };
}
