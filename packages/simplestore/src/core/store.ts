// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Core Store - pure business logic, no AWS dependencies
 */

import {
  ServerContext,
  StoreRequest,
  StoreItem,
  StoreResult,
  DataType,
  StorageAdapter,
  StoreConfig,
  DEFAULT_CONFIG,
} from "./types";
import { parseTtl } from "./validation";

/** Error message constants */
export const ERRORS = {
  NOT_FOUND: "Item not found",
  ACCESS_DENIED: "Access denied: not owner",
} as const;

/**
 * Builds partition key for context-based grouping
 * Private type includes userId for user-level isolation
 */
function buildPartitionKey(
  context: ServerContext,
  type: DataType,
  delimiter: string,
): string {
  const { app, tenant, env, userId } = context;
  const base = [app, tenant, env, type].join(delimiter);
  return type === "private" ? `${base}${delimiter}${userId}` : base;
}

/**
 * Builds compound sort key from entity identifiers
 */
function buildSortKey(
  entityPk: string,
  entitySk: string,
  delimiter: string,
): string {
  return `${entityPk}${delimiter}${entitySk}`;
}

/**
 * Builds complete PK/SK pair for DynamoDB operations
 */
function buildKeys(
  context: ServerContext,
  type: DataType,
  entityPk: string,
  entitySk: string,
  delimiter: string,
): { pk: string; sk: string } {
  return {
    pk: buildPartitionKey(context, type, delimiter),
    sk: buildSortKey(entityPk, entitySk, delimiter),
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
    config: Partial<StoreConfig> = {},
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
      return { success: false, error: ttlResult.error };
    }

    const keys = this.resolveKeys(request.type, request.pk, request.sk);

    return this.wrapAsync(async () => {
      const existing = await this.adapter.get(keys.pk, keys.sk);
      const item = this.createItem(keys, request, existing?.createdAt);
      await this.adapter.put(item);
      return { success: true, item };
    });
  }

  /**
   * Retrieves an item by key
   */
  async get(
    entityPk: string,
    entitySk: string,
    type: DataType,
  ): Promise<StoreResult> {
    const keys = this.resolveKeys(type, entityPk, entitySk);

    return this.wrapAsync(async () => {
      const item = await this.adapter.get(keys.pk, keys.sk);
      return item
        ? { success: true, item }
        : { success: false, error: ERRORS.NOT_FOUND };
    });
  }

  /**
   * Deletes an item (owner only for private/unlisted/public, anyone for shared)
   */
  async delete(
    entityPk: string,
    entitySk: string,
    type: DataType,
  ): Promise<StoreResult> {
    const keys = this.resolveKeys(type, entityPk, entitySk);

    return this.wrapAsync(async () => {
      const existing = await this.adapter.get(keys.pk, keys.sk);

      if (!existing) {
        return { success: false, error: ERRORS.NOT_FOUND };
      }

      if (type !== "shared" && !this.isOwner(existing)) {
        return { success: false, error: ERRORS.ACCESS_DENIED };
      }

      await this.adapter.delete(keys.pk, keys.sk);
      return { success: true };
    });
  }

  /**
   * Queries items by sort key prefix
   */
  async query(entityPkPrefix: string, type: DataType): Promise<StoreResult> {
    const pk = this.resolvePartitionKey(type);

    return this.wrapAsync(async () => {
      const items = await this.adapter.queryBySortKeyPrefix(pk, entityPkPrefix);
      return { success: true, items };
    });
  }

  private resolvePartitionKey(type: DataType): string {
    return buildPartitionKey(this.context, type, this.config.keyDelimiter);
  }

  private resolveKeys(
    type: DataType,
    entityPk: string,
    entitySk: string,
  ): { pk: string; sk: string } {
    return buildKeys(this.context, type, entityPk, entitySk, this.config.keyDelimiter);
  }

  private async wrapAsync(
    fn: () => Promise<StoreResult>,
  ): Promise<StoreResult> {
    try {
      return await fn();
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private createItem(
    keys: { pk: string; sk: string },
    request: StoreRequest,
    existingCreatedAt?: string,
  ): StoreItem {
    const now = new Date().toISOString();

    const item: StoreItem = {
      PK: keys.pk,
      SK: keys.sk,
      data: request.data ?? {},
      owner: this.context.userId,
      createdAt: existingCreatedAt ?? now,
      updatedAt: now,
    };

    if (request.ttl > 0) {
      return { ...item, ttl: this.calculateTtl(request.ttl) };
    }

    return item;
  }

  private calculateTtl(ttlSeconds: number): number {
    return Math.floor(Date.now() / 1000) + ttlSeconds;
  }

  private isOwner(item: StoreItem): boolean {
    return item.owner === this.context.userId;
  }
}

// Re-export key building functions for external use
export { buildPartitionKey, buildSortKey, buildKeys };
