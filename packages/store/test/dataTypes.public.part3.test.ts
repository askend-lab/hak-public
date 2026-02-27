// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * TDD tests for 4-type data access system (public, shared, type isolation)
 *
 * Types:
 * - public: everyone sees/searches, only owner modifies
 * - shared: everyone sees, everyone can modify
 */

import { Store } from "../src/core/store";
import { ServerContext, DataType } from "../src/core/types";
import { InMemoryAdapter } from "../src/adapters/memory";

describe("dataTypes.public.test", () => {
  let db: InMemoryAdapter;

  const ownerContext: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "owner123",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
  });

  describe("type isolation", () => {
    it("same pk/sk with different types are isolated", async () => {
      const store = new Store(db, ownerContext);

      await store.save({
        key: "data",
        id: "key1",
        type: "private",
        ttl: 3600,
        data: { type: "private" },
      });
      await store.save({
        key: "data",
        id: "key1",
        type: "public",
        ttl: 3600,
        data: { type: "public" },
      });
      await store.save({
        key: "data",
        id: "key1",
        type: "unlisted" as DataType,
        ttl: 3600,
        data: { type: "unlisted" },
      });
      await store.save({
        key: "data",
        id: "key1",
        type: "shared" as DataType,
        ttl: 3600,
        data: { type: "shared" },
      });

      const privateResult = await store.get("data", "key1", "private");
      const publicResult = await store.get("data", "key1", "public");
      const unlistedResult = await store.get(
        "data",
        "key1",
        "unlisted" as DataType,
      );
      const sharedResult = await store.get(
        "data",
        "key1",
        "shared" as DataType,
      );

      expect(privateResult.item?.data).toStrictEqual({ type: "private" });
      expect(publicResult.item?.data).toStrictEqual({ type: "public" });
      expect(unlistedResult.item?.data).toStrictEqual({ type: "unlisted" });
      expect(sharedResult.item?.data).toStrictEqual({ type: "shared" });
    });
  });

});
