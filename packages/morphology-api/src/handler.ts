// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { extractStressedText, extractVariants } from "./parser";
import { logger, extractErrorMessage, loadVersion } from "./logger";
import { LambdaResponse } from "./types";
import { createResponse, parseJsonBody, HTTP_STATUS } from "./validation";
import { analyze, isInitialized, initVmetajson } from "./vmetajson";
import { AnalyzeRequestSchema, VariantsRequestSchema } from "./schemas";
import type { ZodObject, ZodRawShape } from "zod";

// Stryker disable next-line all: env defaults are equivalent
const VMETAJSON_PATH = process.env.VMETAJSON_PATH ?? "./vmetajson";
// Stryker disable next-line all: env defaults are equivalent
const DICT_PATH = process.env.DICT_PATH ?? ".";

function ensureInitialized(): void {
  if (!isInitialized()) {initVmetajson(VMETAJSON_PATH, DICT_PATH);}
}

const version = loadVersion();

const ERRORS = {
  MISSING_BODY: "Missing request body",
  INVALID_JSON: "Invalid JSON",
  NO_VARIANTS: "No phonetic variants found for the word",
  UNKNOWN: "Unknown error",
} as const;

const PROCESSING_ERROR_PREFIX = "Processing error: ";

interface ParsedInput {
  success: true;
  value: string;
}
interface ParseError {
  success: false;
  response: LambdaResponse;
}
type ParseResult = ParsedInput | ParseError;

function badRequest(error: string): ParseError {
  return { success: false, response: createResponse(HTTP_STATUS.BAD_REQUEST, { error }) };
}

function validateBody(
  body: unknown,
  schema: ZodObject<ZodRawShape>,
  fieldName: string,
): ParseResult {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return badRequest(firstError?.message ?? "Invalid request");
  }
  const value = (result.data as Record<string, string>)[fieldName];
  if (!value) {return badRequest(`Missing '${fieldName}' field in request body`);}
  return { success: true, value };
}

function parseAndValidateWithSchema(
  event: APIGatewayProxyEvent,
  schema: ZodObject<ZodRawShape>,
  fieldName: string,
): ParseResult {
  ensureInitialized();
  if (event.body === null) {return badRequest(ERRORS.MISSING_BODY);}
  const body = parseJsonBody(event.body);
  if (body === null) {return badRequest(ERRORS.INVALID_JSON);}
  return validateBody(body, schema, fieldName);
}

function handleError(error: unknown): APIGatewayProxyResult {
  logger.error(PROCESSING_ERROR_PREFIX, extractErrorMessage(error));
  return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    error: `${PROCESSING_ERROR_PREFIX}${ERRORS.UNKNOWN}`,
  });
}

export async function analyzeHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidateWithSchema(
      event,
      AnalyzeRequestSchema,
      "text",
    );
    if (!parsed.success) {return parsed.response;}

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
    const parsed = parseAndValidateWithSchema(event, VariantsRequestSchema, "word");
    if (!parsed.success) {return parsed.response;}

    const response = await analyze(parsed.value);
    const variants = extractVariants(response, parsed.value);

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
