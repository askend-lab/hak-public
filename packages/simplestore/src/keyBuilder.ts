import { config } from './config';
import { ServerContext, DataType } from './types';

const D = config.keyDelimiter;

/**
 * Partition and Sort key pair for DynamoDB
 */
export interface KeyPair {
  readonly pk: string;
  readonly sk: string;
}

/**
 * Builds complete PK/SK pair for DynamoDB operations
 * PK: {app}#{tenant}#{env}#{type}[#{userId}]
 * SK: {entityPk}#{entitySk}
 */
export function buildKeys(
  context: ServerContext,
  type: DataType,
  entityPk: string,
  entitySk: string
): KeyPair {
  return {
    pk: buildPartitionKey(context, type),
    sk: buildSortKey(entityPk, entitySk)
  };
}

/**
 * Builds partition key for context-based grouping
 * Private type includes userId for user-level isolation
 */
export function buildPartitionKey(context: ServerContext, type: DataType): string {
  const { app, tenant, env, userId } = context;
  const base = [app, tenant, env, type].join(D);
  
  return type === 'private' ? `${base}${D}${userId}` : base;
}

/**
 * Builds compound sort key from entity identifiers
 */
export function buildSortKey(entityPk: string, entitySk: string): string {
  return `${entityPk}${D}${entitySk}`;
}

/**
 * Result of TTL parsing - either success with value or failure with error
 */
export type TtlResult = 
  | { readonly valid: true; readonly value: number }
  | { readonly valid: false; readonly error: string };

/**
 * Parses and validates TTL value against constraints
 * @param ttl Time-to-live in seconds
 * @returns TtlResult with parsed value or error message
 */
export function parseTtl(ttl: number): TtlResult {
  if (ttl <= 0) {
    return { valid: false, error: 'TTL must be positive' };
  }
  
  if (ttl > config.maxTtlSeconds) {
    return { valid: false, error: `TTL exceeds maximum of ${String(config.maxTtlSeconds)} seconds (1 year)` };
  }
  
  return { valid: true, value: ttl };
}
