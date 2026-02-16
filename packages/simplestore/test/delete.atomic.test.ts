// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for audit finding #4: delete TOCTOU race condition
 *
 * Current behavior: delete does get → check owner → delete (two operations)
 * Expected behavior after fix: single atomic conditional delete
 *
 * These tests verify the adapter supports conditional delete
 * and the store uses it correctly.
 */

import { StorageAdapter, StoreItem, UpsertFields } from "../src/core/types";
import { Store, ERRORS } from "../src/core/store";
import { ServerContext } from "../src/core/types";

/**
 * Spy adapter that records operation order to detect TOCTOU patterns.
 * After the fix, delete should be a single call (not get-then-delete).
 */
class OperationSpyAdapter implements StorageAdapter {
  readonly operations: string[] = [];
  private readonly data: Map<string, StoreItem> = new Map();

  private key(pk: string, sk: string): string {
    return `${pk}|${sk}`;
  }

  async put(item: StoreItem, _expectedVersion?: number): Promise<void> {
    this.operations.push("put");
    this.data.set(this.key(item.PK, item.SK), { ...item });
  }

  async get(pk: string, sk: string): Promise<StoreItem | null> {
    this.operations.push("get");
    const item = this.data.get(this.key(pk, sk));
    return item ? { ...item } : null;
  }

  async delete(pk: string, sk: string): Promise<void> {
    this.operations.push("delete");
    this.data.delete(this.key(pk, sk));
  }

  async queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
    this.operations.push("query");
    const results: StoreItem[] = [];
    for (const item of this.data.values()) {
      if (item.PK === pk && item.SK.startsWith(skPrefix)) {
        results.push({ ...item });
      }
    }
    return results;
  }

  async upsert(pk: string, sk: string, fields: UpsertFields): Promise<StoreItem> {
    this.operations.push("upsert");
    const existing = this.data.get(this.key(pk, sk));
    const now = new Date().toISOString();
    const item: StoreItem = {
      PK: pk,
      SK: sk,
      data: fields.data,
      owner: fields.owner,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      version: (existing?.version ?? 0) + 1,
      ...(fields.ttl !== undefined ? { ttl: fields.ttl } : {}),
    };
    this.data.set(this.key(pk, sk), { ...item });
    return { ...item };
  }

  resetOps(): void {
    this.operations.length = 0;
  }
}

describe("Audit #4: delete should be atomic (no TOCTOU)", () => {
  const ownerContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "owner123",
  };

  const otherContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "other456",
  };

  it("owner delete on own item should succeed", async () => {
    const spy = new OperationSpyAdapter();
    const store = new Store(spy, ownerContext);

    await store.save({ pk: "doc", sk: "1", type: "public", ttl: 3600, data: {} });
    spy.resetOps();

    const result = await store.delete("doc", "1", "public");
    expect(result.success).toBe(true);
  });

  it("non-owner delete should fail with ACCESS_DENIED", async () => {
    const spy = new OperationSpyAdapter();
    const ownerStore = new Store(spy, ownerContext);
    const otherStore = new Store(spy, otherContext);

    await ownerStore.save({ pk: "doc", sk: "1", type: "public", ttl: 3600, data: {} });
    spy.resetOps();

    const result = await otherStore.delete("doc", "1", "public");
    expect(result.success).toBe(false);
    expect(result.error).toBe(ERRORS.ACCESS_DENIED);
  });

  it("delete of non-existent item should fail with NOT_FOUND", async () => {
    const spy = new OperationSpyAdapter();
    const store = new Store(spy, ownerContext);

    const result = await store.delete("nonexistent", "1", "public");
    expect(result.success).toBe(false);
    expect(result.error).toBe(ERRORS.NOT_FOUND);
  });

  /**
   * After the fix, delete should use a single conditional delete call
   * instead of get-then-delete (two calls). This test will need to be
   * updated when the StorageAdapter interface gets a conditionalDelete method.
   *
   * For now, this test documents the current TOCTOU pattern: it records
   * that two separate adapter calls (get + delete) are made.
   * After fix: this should be a single "conditionalDelete" call.
   */
  it("TOCTOU: current delete uses get-then-delete (two operations)", async () => {
    const spy = new OperationSpyAdapter();
    const store = new Store(spy, ownerContext);

    await store.save({ pk: "doc", sk: "1", type: "public", ttl: 3600, data: {} });
    spy.resetOps();

    await store.delete("doc", "1", "public");

    // Current behavior: get (ownership check) then delete = 2 operations
    // After fix: should be 1 conditional delete operation
    // When implementing the fix, change this assertion:
    //   expect(spy.operations).toEqual(["conditionalDelete"]);
    expect(spy.operations).toStrictEqual(["get", "delete"]);
  });
});
