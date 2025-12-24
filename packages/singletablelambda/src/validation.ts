import { validateTtl } from './keyBuilder';
import { StoreRequest, DataType } from './types';

/**
 * Validation result with collected errors
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

const VALID_TYPES: readonly DataType[] = ['public', 'shared', 'private'] as const;

/**
 * Creates a validation result
 */
function result(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a string field
 */
function validateString(value: unknown, name: string, errors: string[]): void {
  if (value === null || typeof value !== 'string') {
    errors.push(`${name} is required and must be a string`);
  }
}

/**
 * Validates data type field
 */
function validateType(type: unknown, errors: string[]): void {
  if (type === null || !VALID_TYPES.includes(type as DataType)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }
}

/**
 * Validates store request for save operations
 */
export function validateStoreRequest(request: Partial<StoreRequest>): ValidationResult {
  const errors: string[] = [];

  validateString(request.pk, 'pk', errors);
  validateString(request.sk, 'sk', errors);
  validateType(request.type, errors);

  if (typeof request.ttl !== 'number') {
    errors.push('ttl must be a number');
  } else {
    const ttlValidation = validateTtl(request.ttl);
    if (!ttlValidation.valid) {
      errors.push(ttlValidation.error ?? 'Invalid TTL');
    }
  }

  if (request.data !== undefined && typeof request.data !== 'object') {
    errors.push('data must be an object');
  }

  return result(errors);
}

/**
 * Validates get/delete request parameters
 */
export function validateGetRequest(pk: unknown, sk: unknown, type: unknown): ValidationResult {
  const errors: string[] = [];

  validateString(pk, 'pk', errors);
  validateString(sk, 'sk', errors);
  validateType(type, errors);

  return result(errors);
}

/**
 * Validates prefix string (allows empty string for query all)
 */
function validatePrefix(value: unknown, name: string, errors: string[]): void {
  if (value !== undefined && typeof value !== 'string') {
    errors.push(`${name} must be a string`);
  }
}

/**
 * Validates query request parameters
 */
export function validateQueryRequest(pkPrefix: unknown, type: unknown): ValidationResult {
  const errors: string[] = [];

  validatePrefix(pkPrefix, 'prefix', errors);
  validateType(type, errors);

  return result(errors);
}
