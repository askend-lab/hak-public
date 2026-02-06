/**
 * Core Store - pure business logic, no AWS dependencies
 */

import { ServerContext, StoreRequest, StoreItem, StoreResult, DataType, StorageAdapter, StoreConfig } from './types';
import { parseTtl } from './validation';

/** Error message constants */
export const ERRORS = {
  NOT_FOUND: 'Item not found',
  ACCESS_DENIED: 'Access denied: not owner'
} as const;

const DEFAULT_CONFIG: StoreConfig = {
  maxTtlSeconds: 31536000,
  keyDelimiter: '#'
};

/**
 * Builds partition key for context-based grouping
 * Private type includes userId for user-level isolation
 */
function buildPartitionKey(context: ServerContext, type: DataType, delimiter: string): string {
  const { app, tenant, env, userId } = context;
  const base = [app, tenant, env, type].join(delimiter);
  return type === 'private' ? `${base}${delimiter}${userId}` : base;
}

/**
 * Builds compound sort key from entity identifiers
 */
function buildSortKey(entityPk: string, entitySk: string, delimiter: string): string {
  return `${entityPk}${delimiter}${entitySk}`;
}

/**
 * Builds complete PK/SK pair for DynamoDB operations
 */
function buildKeys(context: ServerContext, type: DataType, entityPk: string, entitySk: string, delimiter: string): { pk: string; sk: string } {
  return {
    pk: buildPartitionKey(context, type, delimiter),
    sk: buildSortKey(entityPk, entitySk, delimiter)
  };
}

/**
 * Core store operations - clean business logic
 * Can be used standalone without Lambda
 */
export class Store {
  private readonly config: StoreConfig;

  constructor(
    private readonly adapter: StorageAdapter,
    private readonly context: ServerContext,
    config: Partial<StoreConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Creates or updates an item in the store
   * Preserves createdAt on update, only changes updatedAt
   */
  async save(request: StoreRequest): Promise<StoreResult> {
    const ttlResult = parseTtl(request.ttl, this.config);
    if (!ttlResult.valid) {
      return this.failure(ttlResult.error);
    }

    const keys = buildKeys(this.context, request.type, request.pk, request.sk, this.config.keyDelimiter);
    
    try {
      // Check if item exists to preserve createdAt
      const existing = await this.adapter.get(keys.pk, keys.sk);
      const item = this.createItem(request, existing?.createdAt);
      
      await this.adapter.put(item);
      return this.success(item);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Retrieves an item by key
   */
  async get(entityPk: string, entitySk: string, type: DataType): Promise<StoreResult> {
    const keys = buildKeys(this.context, type, entityPk, entitySk, this.config.keyDelimiter);
    
    try {
      const item = await this.adapter.get(keys.pk, keys.sk);
      return item ? this.success(item) : this.failure(ERRORS.NOT_FOUND);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Deletes an item (owner only for private/unlisted/public, anyone for shared)
   */
  async delete(entityPk: string, entitySk: string, type: DataType): Promise<StoreResult> {
    const keys = buildKeys(this.context, type, entityPk, entitySk, this.config.keyDelimiter);
    
    try {
      const existing = await this.adapter.get(keys.pk, keys.sk);
      
      if (!existing) {
        return this.failure(ERRORS.NOT_FOUND);
      }
      
      if (type !== 'shared' && !this.isOwner(existing)) {
        return this.failure(ERRORS.ACCESS_DENIED);
      }
      
      await this.adapter.delete(keys.pk, keys.sk);
      return this.successEmpty();
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Queries items by sort key prefix
   */
  async query(entityPkPrefix: string, type: DataType): Promise<StoreResult> {
    const pk = buildPartitionKey(this.context, type, this.config.keyDelimiter);
    
    try {
      const items = await this.adapter.queryBySortKeyPrefix(pk, entityPkPrefix);
      return this.successItems(items);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  private createItem(request: StoreRequest, existingCreatedAt?: string): StoreItem {
    const keys = buildKeys(this.context, request.type, request.pk, request.sk, this.config.keyDelimiter);
    const now = new Date().toISOString();
    
    return {
      PK: keys.pk,
      SK: keys.sk,
      data: request.data ?? {},
      owner: this.context.userId,
      createdAt: existingCreatedAt ?? now,
      updatedAt: now,
      ttl: this.calculateTtl(request.ttl)
    };
  }

  private calculateTtl(ttlSeconds: number): number {
    return Math.floor(Date.now() / 1000) + ttlSeconds;
  }

  private isOwner(item: StoreItem): boolean {
    return item.owner === this.context.userId;
  }

  private success(item: StoreItem): StoreResult {
    return { success: true, item };
  }

  private successItems(items: StoreItem[]): StoreResult {
    return { success: true, items };
  }

  private successEmpty(): StoreResult {
    return { success: true };
  }

  private failure(error: string): StoreResult {
    return { success: false, error };
  }
}

// Re-export key building functions for external use
export { buildPartitionKey, buildSortKey, buildKeys };
