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
 * TTL validation result
 */
export interface TtlValidationResult {
  readonly valid: boolean;
  readonly ttl?: number;
  readonly error?: string;
}

/**
 * Validates TTL value against constraints
 * @param ttl Time-to-live in seconds
 */
export function validateTtl(ttl: number): TtlValidationResult {
  if (ttl <= 0) {
    return { valid: false, error: 'TTL must be positive' };
  }
  
  if (ttl > config.maxTtlSeconds) {
    return { valid: false, error: `TTL exceeds maximum of ${config.maxTtlSeconds} seconds (1 year)` };
  }
  
  return { valid: true, ttl };
}
