import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { initVmetajson, analyze, isInitialized } from './vmetajson';
import { extractStressedText, extractVariants } from './parser';
import { AnalyzeRequest, VariantsRequest, LambdaResponse } from './types';

const MAX_TEXT_LENGTH = 10000;
const VMETAJSON_PATH = process.env.VMETAJSON_PATH || './vmetajson';
const DICT_PATH = process.env.DICT_PATH || '.';

function createResponse(statusCode: number, body: object): LambdaResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}

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

function parseAndValidate<T>(
  event: APIGatewayProxyEvent,
  fieldName: string,
  maxLength?: number
): ParseResult<T> {
  if (!isInitialized()) {
    initVmetajson(VMETAJSON_PATH, DICT_PATH);
  }

  if (!event.body) {
    return { success: false, response: createResponse(400, { error: 'Missing request body' }) };
  }

  let body: T;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { success: false, response: createResponse(400, { error: 'Invalid JSON' }) };
  }

  const fieldValue = (body as Record<string, unknown>)[fieldName];
  if (!fieldValue || typeof fieldValue !== 'string') {
    return { success: false, response: createResponse(400, { error: `Missing '${fieldName}' field in request body` }) };
  }

  const value = fieldValue.trim();
  if (!value) {
    return { success: false, response: createResponse(400, { error: `'${fieldName}' must be a non-empty string` }) };
  }

  if (maxLength && value.length > maxLength) {
    return { success: false, response: createResponse(400, { error: `Text is too long (max ${maxLength} characters)` }) };
  }

  return { success: true, body, value };
}

export async function analyzeHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<AnalyzeRequest>(event, 'text', MAX_TEXT_LENGTH);
    if (!parsed.success) return parsed.response;

    const { value: text } = parsed;
    const response = await analyze(text);
    const stressedText = extractStressedText(response, text);

    return createResponse(200, {
      stressedText,
      originalText: text
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createResponse(500, { error: `Processing error: ${message}` });
  }
}

export async function variantsHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const parsed = parseAndValidate<VariantsRequest>(event, 'word');
    if (!parsed.success) return parsed.response;

    const { value: word } = parsed;
    const response = await analyze(word);
    const variants = extractVariants(response, word);

    if (variants.length === 0) {
      return createResponse(500, { error: 'No phonetic variants found for the word' });
    }

    return createResponse(200, {
      word,
      variants
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createResponse(500, { error: `Processing error: ${message}` });
  }
}

export async function healthHandler(): Promise<APIGatewayProxyResult> {
  return createResponse(200, {
    status: 'ok',
    version: '1.0.0'
  });
}
