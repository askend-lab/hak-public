import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TEXT_LIMITS } from '@hak/shared';

import { extractStressedText, extractVariants } from './parser';
import { AnalyzeRequest, VariantsRequest, LambdaResponse } from './types';
import { createResponse, ensureInitialized, parseJsonBody, validateField } from './validation';
import { analyze } from './vmetajson';

const { version } = require('../package.json') as { version: string };

const MAX_TEXT_LENGTH = TEXT_LIMITS.MAX_MORPHOLOGY_TEXT_LENGTH;

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500
} as const;

interface ParsedInput<T> { success: true; body: T; value: string; }
interface ParseError { success: false; response: LambdaResponse; }
type ParseResult<T> = ParsedInput<T> | ParseError;

function parseAndValidate<T>(event: APIGatewayProxyEvent, fieldName: string, maxLength?: number): ParseResult<T> {
  ensureInitialized();
   
  if (event.body === null) return { success: false, response: createResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Missing request body' }) };

  const body = parseJsonBody(event.body);
   
  if (body === null) return { success: false, response: createResponse(HTTP_STATUS.BAD_REQUEST, { error: 'Invalid JSON' }) };

  const fieldResult = validateField(body as Record<string, unknown>, fieldName, maxLength);
  if ('error' in fieldResult) return { success: false, response: createResponse(HTTP_STATUS.BAD_REQUEST, { error: fieldResult.error }) };

  return { success: true, body: body as T, value: fieldResult.value };
}

function handleError(error: unknown): APIGatewayProxyResult {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return createResponse(HTTP_STATUS.INTERNAL_ERROR, { error: `Processing error: ${message}` });
}

export async function analyzeHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<AnalyzeRequest>(event, 'text', MAX_TEXT_LENGTH);
    if (!parsed.success) return parsed.response;

    const response = await analyze(parsed.value);
    return createResponse(HTTP_STATUS.OK, {
      stressedText: extractStressedText(response, parsed.value),
      originalText: parsed.value
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function variantsHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<VariantsRequest>(event, 'word');
    if (!parsed.success) return parsed.response;

    const response = await analyze(parsed.value);
    const variants = extractVariants(response, parsed.value);

    if (variants.length === 0) return createResponse(HTTP_STATUS.INTERNAL_ERROR, { error: 'No phonetic variants found for the word' });

    return createResponse(HTTP_STATUS.OK, { word: parsed.value, variants });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export function healthHandler(): APIGatewayProxyResult {
  return createResponse(HTTP_STATUS.OK, {
    status: 'ok',
    version
  });
}
