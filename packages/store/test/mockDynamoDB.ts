// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StorageAdapter, StoreItem } from "../src/core/types";

export class FailingDynamoDB implements StorageAdapter {
  put(_item: StoreItem, _expectedVersion?: number): Promise<void> {
    throw new Error("DB error");
  }
  get(): Promise<StoreItem | null> {
    throw new Error("DB error");
  }
  delete(): Promise<void> {
    throw new Error("DB error");
  }
  queryBySortKeyPrefix(): Promise<StoreItem[]> {
    throw new Error("DB error");
  }
  upsert(): Promise<StoreItem> {
    throw new Error("DB error");
  }
}

