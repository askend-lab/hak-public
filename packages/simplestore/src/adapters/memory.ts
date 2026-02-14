// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * In-memory storage adapter for testing
 */

import { StorageAdapter, StoreItem, DEFAULT_CONFIG } from "../core/types";
import { VersionConflictError } from "./dynamodb";

/**
 * In-memory store implementing StorageAdapter interface
 * For testing without AWS dependencies - provides test isolation
 */
export class InMemoryAdapter implements StorageAdapter {
  private readonly data: Map<string, StoreItem> = new Map();
  private readonly delimiter: string;

  constructor(delimiter: string = DEFAULT_CONFIG.keyDelimiter) {
    this.delimiter = delimiter;
  }

  private buildKey(pk: string, sk: string): string {
    return `${pk}${this.delimiter}${sk}`;
  }

  async put(item: StoreItem, expectedVersion?: number): Promise<void> {
    const key = this.buildKey(item.PK, item.SK);
    if (expectedVersion !== undefined) {
      const existing = this.data.get(key);
      const currentVersion = existing?.version ?? 0;
      if (existing && currentVersion !== expectedVersion) {
        throw new VersionConflictError(
          "Item was modified by another request. Please retry.",
        );
      }
    }
    this.data.set(key, { ...item });
  }

  async get(pk: string, sk: string): Promise<StoreItem | null> {
    const key = this.buildKey(pk, sk);
    const item = this.data.get(key);
    return item ? { ...item } : null;
  }

  async delete(pk: string, sk: string): Promise<void> {
    const key = this.buildKey(pk, sk);
    this.data.delete(key);
  }

  async queryBySortKeyPrefix(
    pk: string,
    skPrefix: string,
  ): Promise<StoreItem[]> {
    const results: StoreItem[] = [];

    for (const item of this.data.values()) {
      if (item.PK === pk && item.SK.startsWith(skPrefix)) {
        results.push({ ...item });
      }
    }

    return results;
  }

  /** Reset all data (for test isolation) */
  clear(): void {
    this.data.clear();
  }

  /** Get current item count (for assertions) */
  size(): number {
    return this.data.size;
  }

  /** Seed test data */
  seed(items: StoreItem[]): void {
    for (const item of items) {
      this.data.set(this.buildKey(item.PK, item.SK), { ...item });
    }
  }
}
