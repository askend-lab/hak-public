import { LambdaResponse } from './types';
import { initVmetajson, isInitialized } from './vmetajson';

const VMETAJSON_PATH = process.env.VMETAJSON_PATH || './vmetajson';
const DICT_PATH = process.env.DICT_PATH || '.';

export function createResponse(statusCode: number, body: object): LambdaResponse {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  };
}

export function ensureInitialized(): void {
  if (!isInitialized()) initVmetajson(VMETAJSON_PATH, DICT_PATH);
}

export function parseJsonBody<T>(eventBody: string | null): T | null {
  if (!eventBody) return null;
  try { return JSON.parse(eventBody); } catch { return null; }
}

export function getFieldError(fieldValue: unknown, fieldName: string, maxLength?: number): string | null {
  if (!fieldValue || typeof fieldValue !== 'string') return `Missing '${fieldName}' field in request body`;
  if (!fieldValue.trim()) return `'${fieldName}' must be a non-empty string`;
  if (maxLength && fieldValue.length > maxLength) return `Text is too long (max ${maxLength} characters)`;
  return null;
}

export function validateField(body: Record<string, unknown>, fieldName: string, maxLength?: number): { value: string } | { error: string } {
  const error = getFieldError(body[fieldName], fieldName, maxLength);
  if (error) return { error };
  return { value: (body[fieldName] as string).trim() };
}
