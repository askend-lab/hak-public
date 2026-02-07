/**
 * TDD tests for 4-type data access system
 * 
 * Types:
 * - private: only owner sees, only owner modifies
 * - unlisted: owner modifies, anyone with exact key can read, no query/search
 * - public: everyone sees/searches, only owner modifies
 * - shared: everyone sees, everyone can modify
 */

import { Store } from '../src/core/store';
import { ServerContext, DataType } from '../src/core/types';
import { InMemoryAdapter } from '../src/adapters/memory';

describe('Data Types Access Control', () => {
  let db: InMemoryAdapter;
  
  const ownerContext: ServerContext = {
    app: 'testapp',
    tenant: 'tenant1',
    env: 'dev',
    userId: 'owner123'
  };
  
  const otherUserContext: ServerContext = {
    app: 'testapp',
    tenant: 'tenant1',
    env: 'dev',
    userId: 'otherUser456'
  };

  beforeEach(() => {
    db = new InMemoryAdapter();
  });

  describe('private type', () => {
    it('owner can save private item', async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        pk: 'my-data',
        sk: 'key1',
        type: 'private',
        ttl: 3600,
        data: { secret: 'value' }
      });
      expect(result.success).toBe(true);
    });

    it('owner can read own private item', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'my-data', sk: 'key1', type: 'private', ttl: 3600, data: { secret: 'value' } });
      
      const result = await store.get('my-data', 'key1', 'private');
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ secret: 'value' });
    });

    it('other user cannot read private item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'my-data', sk: 'key1', type: 'private', ttl: 3600, data: { secret: 'value' } });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get('my-data', 'key1', 'private');
      expect(result.success).toBe(false);
    });

    it('owner can delete own private item', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'my-data', sk: 'key1', type: 'private', ttl: 3600, data: {} });
      
      const result = await store.delete('my-data', 'key1', 'private');
      expect(result.success).toBe(true);
    });

    it('owner can query own private items', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'settings', sk: 'theme', type: 'private', ttl: 3600, data: {} });
      await store.save({ pk: 'settings', sk: 'lang', type: 'private', ttl: 3600, data: {} });
      
      const result = await store.query('settings', 'private');
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });
  });

  describe('unlisted type', () => {
    it('owner can save unlisted item', async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        pk: 'shared-doc',
        sk: 'doc1',
        type: 'unlisted' as DataType,
        ttl: 3600,
        data: { content: 'hello' }
      });
      expect(result.success).toBe(true);
    });

    it('owner can read unlisted item', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'shared-doc', sk: 'doc1', type: 'unlisted' as DataType, ttl: 3600, data: { content: 'hello' } });
      
      const result = await store.get('shared-doc', 'doc1', 'unlisted' as DataType);
      expect(result.success).toBe(true);
    });

    it('other user can read unlisted item with exact key', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'shared-doc', sk: 'doc1', type: 'unlisted' as DataType, ttl: 3600, data: { content: 'hello' } });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get('shared-doc', 'doc1', 'unlisted' as DataType);
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ content: 'hello' });
    });

    it('other user cannot modify unlisted item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'shared-doc', sk: 'doc1', type: 'unlisted' as DataType, ttl: 3600, data: { content: 'hello' } });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.delete('shared-doc', 'doc1', 'unlisted' as DataType);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not owner');
    });

    it('owner can delete unlisted item', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'shared-doc', sk: 'doc1', type: 'unlisted' as DataType, ttl: 3600, data: {} });
      
      const result = await store.delete('shared-doc', 'doc1', 'unlisted' as DataType);
      expect(result.success).toBe(true);
    });
  });

  describe('public type', () => {
    it('owner can save public item', async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        pk: 'article',
        sk: 'post1',
        type: 'public',
        ttl: 3600,
        data: { title: 'Hello World' }
      });
      expect(result.success).toBe(true);
    });

    it('any user can read public item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'article', sk: 'post1', type: 'public', ttl: 3600, data: { title: 'Hello World' } });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get('article', 'post1', 'public');
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ title: 'Hello World' });
    });

    it('any user can query public items', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'article', sk: 'post1', type: 'public', ttl: 3600, data: {} });
      await ownerStore.save({ pk: 'article', sk: 'post2', type: 'public', ttl: 3600, data: {} });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.query('article', 'public');
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it('other user cannot modify public item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'article', sk: 'post1', type: 'public', ttl: 3600, data: {} });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.delete('article', 'post1', 'public');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not owner');
    });

    it('owner can delete public item', async () => {
      const store = new Store(db, ownerContext);
      await store.save({ pk: 'article', sk: 'post1', type: 'public', ttl: 3600, data: {} });
      
      const result = await store.delete('article', 'post1', 'public');
      expect(result.success).toBe(true);
    });
  });

  describe('shared type', () => {
    it('any user can save shared item', async () => {
      const store = new Store(db, ownerContext);
      const result = await store.save({
        pk: 'wiki',
        sk: 'page1',
        type: 'shared' as DataType,
        ttl: 3600,
        data: { content: 'Initial content' }
      });
      expect(result.success).toBe(true);
    });

    it('any user can read shared item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'wiki', sk: 'page1', type: 'shared' as DataType, ttl: 3600, data: { content: 'Hello' } });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.get('wiki', 'page1', 'shared' as DataType);
      expect(result.success).toBe(true);
      expect(result.item?.data).toStrictEqual({ content: 'Hello' });
    });

    it('any user can query shared items', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'wiki', sk: 'page1', type: 'shared' as DataType, ttl: 3600, data: {} });
      await ownerStore.save({ pk: 'wiki', sk: 'page2', type: 'shared' as DataType, ttl: 3600, data: {} });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.query('wiki', 'shared' as DataType);
      expect(result.success).toBe(true);
      expect(result.items?.length).toBe(2);
    });

    it('any user can delete shared item (not just owner)', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'wiki', sk: 'page1', type: 'shared' as DataType, ttl: 3600, data: {} });
      
      const otherStore = new Store(db, otherUserContext);
      const result = await otherStore.delete('wiki', 'page1', 'shared' as DataType);
      expect(result.success).toBe(true);
    });

    it('any user can overwrite shared item', async () => {
      const ownerStore = new Store(db, ownerContext);
      await ownerStore.save({ pk: 'wiki', sk: 'page1', type: 'shared' as DataType, ttl: 3600, data: { v: 1 } });
      
      const otherStore = new Store(db, otherUserContext);
      const saveResult = await otherStore.save({ pk: 'wiki', sk: 'page1', type: 'shared' as DataType, ttl: 3600, data: { v: 2 } });
      expect(saveResult.success).toBe(true);
      
      const getResult = await ownerStore.get('wiki', 'page1', 'shared' as DataType);
      expect(getResult.item?.data).toStrictEqual({ v: 2 });
    });
  });

  describe('type isolation', () => {
    it('same pk/sk with different types are isolated', async () => {
      const store = new Store(db, ownerContext);
      
      await store.save({ pk: 'data', sk: 'key1', type: 'private', ttl: 3600, data: { type: 'private' } });
      await store.save({ pk: 'data', sk: 'key1', type: 'public', ttl: 3600, data: { type: 'public' } });
      await store.save({ pk: 'data', sk: 'key1', type: 'unlisted' as DataType, ttl: 3600, data: { type: 'unlisted' } });
      await store.save({ pk: 'data', sk: 'key1', type: 'shared' as DataType, ttl: 3600, data: { type: 'shared' } });
      
      const privateResult = await store.get('data', 'key1', 'private');
      const publicResult = await store.get('data', 'key1', 'public');
      const unlistedResult = await store.get('data', 'key1', 'unlisted' as DataType);
      const sharedResult = await store.get('data', 'key1', 'shared' as DataType);
      
      expect(privateResult.item?.data).toStrictEqual({ type: 'private' });
      expect(publicResult.item?.data).toStrictEqual({ type: 'public' });
      expect(unlistedResult.item?.data).toStrictEqual({ type: 'unlisted' });
      expect(sharedResult.item?.data).toStrictEqual({ type: 'shared' });
    });
  });
});
