import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { extractStressedText, extractVariants } from './parser';
import { AnalyzeRequest, VariantsRequest, LambdaResponse } from './types';
import { createResponse, ensureInitialized, parseJsonBody, validateField } from './validation';
import { analyze } from './vmetajson';

const MAX_TEXT_LENGTH = 10000;

interface ParsedInput<T> { success: true; body: T; value: string; }
interface ParseError { success: false; response: LambdaResponse; }
type ParseResult<T> = ParsedInput<T> | ParseError;

function parseAndValidate<T>(event: APIGatewayProxyEvent, fieldName: string, maxLength?: number): ParseResult<T> {
  ensureInitialized();
  if (!event.body) return { success: false, response: createResponse(400, { error: 'Missing request body' }) };

  const body = parseJsonBody<T>(event.body);
  if (!body) return { success: false, response: createResponse(400, { error: 'Invalid JSON' }) };

  const fieldResult = validateField(body as Record<string, unknown>, fieldName, maxLength);
  if ('error' in fieldResult) return { success: false, response: createResponse(400, { error: fieldResult.error }) };

  return { success: true, body, value: fieldResult.value };
}

function handleError(error: unknown): APIGatewayProxyResult {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return createResponse(500, { error: `Processing error: ${message}` });
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

    if (variants.length === 0) return createResponse(500, { error: 'No phonetic variants found for the word' });

    return createResponse(200, { word: parsed.value, variants });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function healthHandler(): Promise<APIGatewayProxyResult> {
  return createResponse(200, {
    status: 'ok',
    version: '1.0.0'
  });
}
