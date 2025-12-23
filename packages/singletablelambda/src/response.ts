import { APIGatewayProxyResult } from 'aws-lambda';

import { ERRORS } from './store';
import { StoreResult } from './types';

export const HTTP_ERRORS = {
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not found',
  INTERNAL: 'Internal server error',
  INVALID_JSON: 'Invalid JSON body'
} as const;

export const HTTP_UNAUTHORIZED = 401;
export const HTTP_NOT_FOUND = 404;
export const HTTP_INTERNAL_ERROR = 500;

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERRORS.NOT_FOUND]: 404,
  [ERRORS.ACCESS_DENIED]: 403
};

function getErrorStatusCode(error: string | undefined, defaultStatus: number): number {
  return error ? (ERROR_STATUS_MAP[error] ?? defaultStatus) : defaultStatus;
}

export function createResponse(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body)
  };
}

export function createErrorResponse(result: StoreResult, defaultStatus = 500): APIGatewayProxyResult {
  return createResponse(getErrorStatusCode(result.error, defaultStatus), { error: result.error });
}

export function isResponse(result: unknown): result is APIGatewayProxyResult {
  return typeof result === 'object' && result !== null && 'statusCode' in result;
}
