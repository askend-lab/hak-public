import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { extractStressedText, extractVariants } from './parser';
import { AnalyzeRequest, VariantsRequest, LambdaResponse } from './types';
import { createResponse, ensureInitialized, parseJsonBody, validateField } from './validation';
import { analyze } from './vmetajson';

const MAX_TEXT_LENGTH = 10000;
const HTTP_BAD_REQUEST = 400;
const HTTP_OK = 200;
const HTTP_INTERNAL_SERVER_ERROR = 500;

interface ParsedInput<T> { success: true; body: T; value: string; }
interface ParseError { success: false; response: LambdaResponse; }
type ParseResult<T> = ParsedInput<T> | ParseError;

function parseAndValidate<T>(event: APIGatewayProxyEvent, fieldName: string, maxLength?: number): ParseResult<T> {
  ensureInitialized();
   
  if (event.body === null) return { success: false, response: createResponse(HTTP_BAD_REQUEST, { error: 'Missing request body' }) };

  const body = parseJsonBody(event.body);
   
  if (body === null) return { success: false, response: createResponse(HTTP_BAD_REQUEST, { error: 'Invalid JSON' }) };

  const fieldResult = validateField(body as Record<string, unknown>, fieldName, maxLength);
  if ('error' in fieldResult) return { success: false, response: createResponse(HTTP_BAD_REQUEST, { error: fieldResult.error }) };

  return { success: true, body, value: fieldResult.value };
}

function handleError(error: unknown): APIGatewayProxyResult {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return createResponse(HTTP_INTERNAL_SERVER_ERROR, { error: `Processing error: ${message}` });
}

export async function analyzeHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<AnalyzeRequest>(event, 'text', MAX_TEXT_LENGTH);
    if (!parsed.success) return parsed.response;

    const response = await analyze(parsed.value);
    return createResponse(200, {
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

    if (variants.length === 0) return createResponse(HTTP_INTERNAL_SERVER_ERROR, { error: 'No phonetic variants found for the word' });

    return createResponse(HTTP_OK, { word: parsed.value, variants });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export function healthHandler(): APIGatewayProxyResult {
  return createResponse(HTTP_OK, {
    status: 'ok',
    version: '1.0.0'
  });
}
