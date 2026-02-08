// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StorageAdapter, StoreItem } from '../src/core/types';

export class FailingDynamoDB implements StorageAdapter {
  put(): Promise<void> { throw new Error('DB error'); }
  get(): Promise<StoreItem | null> { throw new Error('DB error'); }
  delete(): Promise<void> { throw new Error('DB error'); }
  queryBySortKeyPrefix(): Promise<StoreItem[]> { throw new Error('DB error'); }
}

export class InMemoryDynamoDB implements StorageAdapter {
  private readonly items = new Map<string, StoreItem>();

  private makeKey(pk: string, sk: string): string {
    return `${pk}|${sk}`;
  }

  put(item: StoreItem): Promise<void> {
    const key = this.makeKey(item.PK, item.SK);
    this.items.set(key, { ...item });
    return Promise.resolve();
  }

  get(pk: string, sk: string): Promise<StoreItem | null> {
    const key = this.makeKey(pk, sk);
    const item = this.items.get(key);
    return Promise.resolve(item ? { ...item } : null);
  }

  delete(pk: string, sk: string): Promise<void> {
    const key = this.makeKey(pk, sk);
    this.items.delete(key);
    return Promise.resolve();
  }

  queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
    const results: StoreItem[] = [];
    for (const item of this.items.values()) {
      if (item.PK === pk && item.SK.startsWith(skPrefix)) {
        results.push({ ...item });
      }
    }
    return Promise.resolve(results);
  }

  clear(): void {
    this.items.clear();
  }

  size(): number {
    return this.items.size;
  }
}
