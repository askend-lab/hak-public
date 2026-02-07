import { Store } from '../src/core/store';
import { ServerContext, StoreRequest } from '../src/core/types';

import { InMemoryAdapter } from '../src/adapters/memory';
import { FailingDynamoDB } from './mockDynamoDB';

const ONE_HOUR = 3600;

describe('Store', () => {
  let db: InMemoryAdapter;
  let store: Store;
  const context: ServerContext = {
    app: 'testapp',
    tenant: 'tenant1',
    env: 'dev',
    userId: 'user123'
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
    store = new Store(db, context);
  });

  describe('save', () => {
    it('should save an item successfully', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: { name: 'test' }
      };

      const result = await store.save(request);

      expect(result.success).toBe(true);
      expect(result.item).toBeDefined();
      expect(result.item?.data).toStrictEqual({ name: 'test' });
      expect(result.item?.owner).toBe('user123');
      expect(db.size()).toBe(1);
    });

    it('should accept TTL of zero (no expiration)', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: 0,
        data: {}
      };

      const result = await store.save(request);

      expect(result.success).toBe(true);
    });

    it('should reject negative TTL', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: -1,
        data: {}
      };

      const result = await store.save(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('TTL');
    });

    it('should set owner from context', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'public',
        ttl: ONE_HOUR,
        data: {}
      };

      const result = await store.save(request);

      expect(result.item?.owner).toBe(context.userId);
    });

    it('should set timestamps', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'public',
        ttl: ONE_HOUR,
        data: {}
      };

      const result = await store.save(request);

      expect(result.item?.createdAt).toBeDefined();
      expect(result.item?.updatedAt).toBeDefined();
    });

    it('should default data to empty object when undefined', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'public',
        ttl: 3600
      } as StoreRequest;

      const result = await store.save(request);

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({});
    });

    it('should preserve createdAt when updating existing item', async () => {
      const request: StoreRequest = {
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: { version: 1 }
      };

      const createResult = await store.save(request);
      const originalCreatedAt = createResult.item?.createdAt;

      // Wait a bit to ensure timestamps differ
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateResult = await store.save({
        ...request,
        data: { version: 2 }
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.item?.createdAt).toEqual(originalCreatedAt);
      expect(updateResult.item?.data).toStrictEqual({ version: 2 });
    });
  });

  describe('get', () => {
    it('should retrieve existing item', async () => {
      await store.save({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: { value: 42 }
      });

      const result = await store.get('entity1', 'sort1', 'private');

      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ value: 42 });
    });

    it('should return error for non-existent item', async () => {
      const result = await store.get('nonexistent', 'sort1', 'private');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not find private item when querying as public', async () => {
      await store.save({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: {}
      });

      const result = await store.get('entity1', 'sort1', 'public');

      expect(result.success).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete own item', async () => {
      await store.save({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: {}
      });

      const result = await store.delete('entity1', 'sort1', 'private');

      expect(result.success).toBe(true);
      expect(db.size()).toBe(0);
    });

    it('should not delete non-existent item', async () => {
      const result = await store.delete('nonexistent', 'sort1', 'private');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not delete item owned by another user', async () => {
      await store.save({
        pk: 'entity1',
        sk: 'sort1',
        type: 'public',
        ttl: ONE_HOUR,
        data: {}
      });

      const otherContext: ServerContext = { ...context, userId: 'otherUser' };
      const otherStore = new Store(db, otherContext);

      const result = await otherStore.delete('entity1', 'sort1', 'public');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not owner');
      expect(db.size()).toBe(1);
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      await store.save({ pk: 'user-settings', sk: 'theme', type: 'private', ttl: ONE_HOUR, data: { color: 'dark' } });
      await store.save({ pk: 'user-settings', sk: 'lang', type: 'private', ttl: ONE_HOUR, data: { lang: 'en' } });
      await store.save({ pk: 'app-config', sk: 'v1', type: 'private', ttl: ONE_HOUR, data: {} });
    });

    it('should query items by prefix', async () => {
      const result = await store.query('user-', 'private');

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it('should return empty array for no matches', async () => {
      const result = await store.query('nonexistent-', 'private');

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(0);
    });

    it('should not find items of different type', async () => {
      const result = await store.query('user-', 'public');

      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(0);
    });
  });

  describe('error handling', () => {
    let failingStore: Store;

    beforeEach(() => {
      failingStore = new Store(new FailingDynamoDB(), context);
    });

    it('should handle save errors', async () => {
      const result = await failingStore.save({
        pk: 'entity1',
        sk: 'sort1',
        type: 'private',
        ttl: ONE_HOUR,
        data: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB error');
    });

    it('should handle get errors', async () => {
      const result = await failingStore.get('entity1', 'sort1', 'private');

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB error');
    });

    it('should handle delete errors', async () => {
      const result = await failingStore.delete('entity1', 'sort1', 'private');

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB error');
    });

    it('should handle query errors', async () => {
      const result = await failingStore.query('prefix-', 'private');

      expect(result.success).toBe(false);
      expect(result.error).toContain('DB error');
    });
  });
});
