// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { extractStressedText, extractVariants } from "./parser";
import { AnalyzeRequest, VariantsRequest, LambdaResponse } from "./types";
import { createResponse, parseJsonBody, validateField } from "./validation";
import { analyze, isInitialized, initVmetajson } from "./vmetajson";

// Stryker disable next-line all: env defaults are equivalent
const VMETAJSON_PATH = process.env.VMETAJSON_PATH ?? "./vmetajson";
// Stryker disable next-line all: env defaults are equivalent
const DICT_PATH = process.env.DICT_PATH ?? ".";

function ensureInitialized(): void {
  if (!isInitialized()) initVmetajson(VMETAJSON_PATH, DICT_PATH);
}

// Docker: both files in /var/task/, Dev: package.json is one level up from src/
function loadVersion(): string {
  try {
    return require("./package.json").version;
  } catch {
    return require("../package.json").version;
  }
}
const version = loadVersion();

// Kept in sync with @hak/shared TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH
const MAX_TEXT_LENGTH = 10_000;

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
} as const;

const ERRORS = {
  MISSING_BODY: "Missing request body",
  INVALID_JSON: "Invalid JSON",
  NO_VARIANTS: "No phonetic variants found for the word",
  UNKNOWN: "Unknown error",
} as const;

interface ParsedInput<T> {
  success: true;
  body: T;
  value: string;
}
interface ParseError {
  success: false;
  response: LambdaResponse;
}
type ParseResult<T> = ParsedInput<T> | ParseError;

function badRequest(error: string): ParseError {
  return { success: false, response: createResponse(HTTP_STATUS.BAD_REQUEST, { error }) };
}

function parseAndValidate<T>(
  event: APIGatewayProxyEvent,
  fieldName: string,
  maxLength?: number,
): ParseResult<T> {
  ensureInitialized();

  if (event.body === null) return badRequest(ERRORS.MISSING_BODY);

  const body = parseJsonBody(event.body);
  if (body === null) return badRequest(ERRORS.INVALID_JSON);

  const fieldResult = validateField(
    body as Record<string, unknown>,
    fieldName,
    maxLength,
  );
  if ("error" in fieldResult) return badRequest(fieldResult.error);

  return { success: true, body: body as T, value: fieldResult.value };
}

function handleError(error: unknown): APIGatewayProxyResult {
  const message = error instanceof Error ? error.message : ERRORS.UNKNOWN;
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, {
    error: `Processing error: ${message}`,
  });
}

export async function analyzeHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<AnalyzeRequest>(
      event,
      "text",
      MAX_TEXT_LENGTH,
    );
    if (!parsed.success) return parsed.response;

    const response = await analyze(parsed.value);
    return createResponse(HTTP_STATUS.OK, {
      stressedText: extractStressedText(response, parsed.value),
      originalText: parsed.value,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function variantsHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<VariantsRequest>(event, "word");
    if (!parsed.success) return parsed.response;

    const response = await analyze(parsed.value);
    const variants = extractVariants(response, parsed.value);

    if (variants.length === 0)
      return createResponse(HTTP_STATUS.INTERNAL_ERROR, {
        error: ERRORS.NO_VARIANTS,
      });

    return createResponse(HTTP_STATUS.OK, { word: parsed.value, variants });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export function healthHandler(): APIGatewayProxyResult {
  return createResponse(HTTP_STATUS.OK, {
    status: "ok",
    version,
  });
}
