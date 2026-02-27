// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { Store } from "../src/core/store";
import { ServerContext } from "../src/core/types";

import { InMemoryAdapter } from "../src/adapters/memory";

const ONE_HOUR = 3600;

describe("store.test", () => {
  let db: InMemoryAdapter;
  let store: Store;
  const context: ServerContext = {
    app: "testapp",
    tenant: "tenant1",
    env: "dev",
    userId: "user123",
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
    store = new Store(db, context);
  });

  describe("TTL calculation", () => {
    it("should calculate TTL correctly (future timestamp)", async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const result = await store.save({
        key: "ttl-test",
        id: "sort1",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      expect(result.success).toBe(true);
      // TTL should be in the future, roughly now + ONE_HOUR
      const ttlValue = result.item?.ttl;
      expect(ttlValue).toBeGreaterThan(nowSeconds);
      expect(ttlValue).toBeLessThan(nowSeconds + ONE_HOUR + 10); // Allow 10s tolerance
    });

    it("should use key delimiter in composite keys", async () => {
      const result = await store.save({
        key: "pk-part",
        id: "sk-part",
        type: "private",
        ttl: ONE_HOUR,
        data: {},
      });

      expect(result.success).toBe(true);
      // The PK should contain the delimiter (default "#")
      expect(result.item?.PK).toContain("#");
    });
  });

  describe("config handling", () => {
    it("should use custom config when provided", () => {
      const customStore = new Store(db, context, {
        maxTtlSeconds: 1000,
        maxDataSizeBytes: 350000,
        keyDelimiter: "|",
      });
      expect(customStore).toBeDefined();
    });
  });

});
