/**
 * Core types for SimpleStore - no external dependencies
 */

/**
 * Data access type determining visibility and access rules
 * - private: only owner sees and modifies
 * - unlisted: owner modifies, anyone with key can read
 * - public: everyone sees/searches, owner modifies
 * - shared: everyone sees, everyone can modify
 */
export type DataType = 'private' | 'unlisted' | 'public' | 'shared';

/**
 * Server-side context extracted from authentication and configuration
 * These values are never provided by the client
 */
export interface ServerContext {
  readonly app: string;
  readonly tenant: string;
  readonly env: string;
  readonly userId: string;
}

/**
 * Client request for store operations
 */
export interface StoreRequest {
  readonly pk: string;
  readonly sk: string;
  readonly type: DataType;
  readonly ttl: number;
  readonly data?: Record<string, unknown>;
}

/**
 * DynamoDB item structure
 */
export interface StoreItem {
  readonly PK: string;
  readonly SK: string;
  readonly data: Record<string, unknown>;
  readonly owner: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly ttl: number;
}

/**
 * Result of store operations
 */
export interface StoreResult {
  readonly success: boolean;
  readonly item?: StoreItem;
  readonly items?: StoreItem[];
  readonly error?: string;
}

/**
 * Configuration for SimpleStore
 */
export interface StoreConfig {
  readonly maxTtlSeconds: number;
  readonly keyDelimiter: string;
}

/**
 * Storage adapter interface - dependency injection point
 */
export interface StorageAdapter {
  put(item: StoreItem): Promise<void>;
  get(pk: string, sk: string): Promise<StoreItem | null>;
  delete(pk: string, sk: string): Promise<void>;
  queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]>;
}
