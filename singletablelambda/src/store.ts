import { ServerContext, StoreRequest, StoreItem, StoreResult, DataType } from './types';
import { buildKeys, buildPartitionKey, validateTtl } from './keyBuilder';

/** Error message constants (DRY - single source of truth) */
export const ERRORS = {
  NOT_FOUND: 'Item not found',
  ACCESS_DENIED: 'Access denied: not owner'
} as const;

/**
 * DynamoDB client interface for dependency injection
 * Enables testing with in-memory implementations
 */
export interface DynamoDBClient {
  put(item: StoreItem): Promise<void>;
  get(pk: string, sk: string): Promise<StoreItem | null>;
  delete(pk: string, sk: string): Promise<void>;
  queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]>;
}

/**
 * Core store operations following Single Responsibility Principle
 * Each method handles one type of operation
 */
export class Store {
  constructor(
    private readonly client: DynamoDBClient,
    private readonly context: ServerContext
  ) {}

  /**
   * Creates or updates an item in the store
   */
  async save(request: StoreRequest): Promise<StoreResult> {
    const ttlValidation = validateTtl(request.ttl);
    if (!ttlValidation.valid) {
      return this.failure(ttlValidation.error!);
    }

    const item = this.createItem(request);

    try {
      await this.client.put(item);
      return this.success(item);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Retrieves an item by key
   */
  async get(entityPk: string, entitySk: string, type: DataType): Promise<StoreResult> {
    const keys = buildKeys(this.context, type, entityPk, entitySk);
    
    try {
      const item = await this.client.get(keys.pk, keys.sk);
      return item ? this.success(item) : this.failure(ERRORS.NOT_FOUND);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Deletes an item (owner only - Iron Rule)
   */
  async delete(entityPk: string, entitySk: string, type: DataType): Promise<StoreResult> {
    const keys = buildKeys(this.context, type, entityPk, entitySk);
    
    try {
      const existing = await this.client.get(keys.pk, keys.sk);
      
      if (!existing) {
        return this.failure(ERRORS.NOT_FOUND);
      }
      
      if (!this.isOwner(existing)) {
        return this.failure(ERRORS.ACCESS_DENIED);
      }
      
      await this.client.delete(keys.pk, keys.sk);
      return this.successEmpty();
    } catch (error) {
      return this.failure(String(error));
    }
  }

  /**
   * Queries items by sort key prefix
   */
  async query(entityPkPrefix: string, type: DataType): Promise<StoreResult> {
    const pk = buildPartitionKey(this.context, type);
    
    try {
      const items = await this.client.queryBySortKeyPrefix(pk, entityPkPrefix);
      return this.successItems(items);
    } catch (error) {
      return this.failure(String(error));
    }
  }

  // Private helper methods (DRY principle)

  private createItem(request: StoreRequest): StoreItem {
    const keys = buildKeys(this.context, request.type, request.pk, request.sk);
    const now = new Date().toISOString();
    
    return {
      PK: keys.pk,
      SK: keys.sk,
      data: request.data ?? {},
      owner: this.context.userId,
      createdAt: now,
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
