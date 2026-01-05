/**
 * Validation logic - pure functions, no external dependencies
 */

import { DataType, StoreRequest, StoreConfig } from './types';

/**
 * Validation result with collected errors
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

const VALID_TYPES: readonly DataType[] = ['private', 'unlisted', 'public', 'shared'] as const;

const DEFAULT_CONFIG: StoreConfig = {
  maxTtlSeconds: 31536000, // 1 year
  keyDelimiter: '#'
};

/**
 * Creates a validation result
 */
function result(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

/**
 * Validates a string field is present and non-empty
 */
function validateRequiredString(value: unknown, name: string, errors: string[]): void {
  if (value === null || value === undefined || typeof value !== 'string') {
    errors.push(`${name} is required and must be a string`);
  } else if (value.trim() === '') {
    errors.push(`${name} cannot be empty`);
  }
}

/**
 * Validates data type field
 */
function validateType(type: unknown, errors: string[]): void {
  if (type === null || type === undefined || !VALID_TYPES.includes(type as DataType)) {
    errors.push(`type must be one of: ${VALID_TYPES.join(', ')}`);
  }
}

/**
 * Result of TTL parsing
 */
export type TtlResult = 
  | { readonly valid: true; readonly value: number }
  | { readonly valid: false; readonly error: string };

/**
 * Parses and validates TTL value against constraints
 */
export function parseTtl(ttl: number, config: StoreConfig = DEFAULT_CONFIG): TtlResult {
  // 0 means no expiration, negative is invalid
  if (ttl < 0) {
    return { valid: false, error: 'TTL must be 0 (no expiration) or positive' };
  }
  
  // 0 = no expiration, skip max check
  if (ttl === 0) {
    return { valid: true, value: 0 };
  }
  
  if (ttl > config.maxTtlSeconds) {
    return { valid: false, error: `TTL exceeds maximum of ${String(config.maxTtlSeconds)} seconds (1 year)` };
  }
  
  return { valid: true, value: ttl };
}

/**
 * Validates store request for save operations
 */
export function validateStoreRequest(request: Partial<StoreRequest>, config: StoreConfig = DEFAULT_CONFIG): ValidationResult {
  const errors: string[] = [];

  validateRequiredString(request.pk, 'pk', errors);
  validateRequiredString(request.sk, 'sk', errors);
  validateType(request.type, errors);

  if (typeof request.ttl !== 'number') {
    errors.push('ttl must be a number');
  } else {
    const ttlResult = parseTtl(request.ttl, config);
    if (!ttlResult.valid) {
      errors.push(ttlResult.error);
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

  validateRequiredString(pk, 'pk', errors);
  validateRequiredString(sk, 'sk', errors);
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

/**
 * Validates server context
 */
export function validateServerContext(context: Partial<Record<string, unknown>>): ValidationResult {
  const errors: string[] = [];

  validateRequiredString(context.app, 'app', errors);
  validateRequiredString(context.tenant, 'tenant', errors);
  validateRequiredString(context.env, 'env', errors);
  validateRequiredString(context.userId, 'userId', errors);

  return result(errors);
}

/**
 * Check if type is valid
 */
export function isValidType(type: unknown): type is DataType {
  return VALID_TYPES.includes(type as DataType);
}

/**
 * Get valid types list
 */
export function getValidTypes(): readonly DataType[] {
  return VALID_TYPES;
}
