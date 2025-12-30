import { InMemoryAdapter } from '../src/adapters/memory';
import { StoreItem } from '../src/core/types';

describe('InMemoryAdapter', () => {
  let adapter: InMemoryAdapter;

  const createItem = (pk: string, sk: string): StoreItem => ({
    PK: pk,
    SK: sk,
    data: { test: 'value' },
    owner: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ttl: Math.floor(Date.now() / 1000) + 3600
  });

  beforeEach(() => {
    adapter = new InMemoryAdapter();
  });

  describe('put', () => {
    it('stores an item', async () => {
      const item = createItem('pk1', 'sk1');
      await adapter.put(item);
      expect(adapter.size()).toBe(1);
    });

    it('overwrites existing item with same key', async () => {
      const item1 = createItem('pk1', 'sk1');
      const item2 = { ...createItem('pk1', 'sk1'), data: { updated: true } };
      
      await adapter.put(item1);
      await adapter.put(item2);
      
      expect(adapter.size()).toBe(1);
      const result = await adapter.get('pk1', 'sk1');
      expect(result?.data).toStrictEqual({ updated: true });
    });
  });

  describe('get', () => {
    it('retrieves existing item', async () => {
      const item = createItem('pk1', 'sk1');
      await adapter.put(item);
      
      const result = await adapter.get('pk1', 'sk1');
      expect(result).toStrictEqual(item);
    });

    it('returns null for non-existent item', async () => {
      const result = await adapter.get('pk1', 'sk1');
      expect(result).toBeNull();
    });

    it('returns copy, not reference', async () => {
      const item = createItem('pk1', 'sk1');
      await adapter.put(item);
      
      const result1 = await adapter.get('pk1', 'sk1');
      const result2 = await adapter.get('pk1', 'sk1');
      
      expect(result1).not.toBe(result2);
      expect(result1).toStrictEqual(result2);
    });
  });

  describe('delete', () => {
    it('removes existing item', async () => {
      const item = createItem('pk1', 'sk1');
      await adapter.put(item);
      
      await adapter.delete('pk1', 'sk1');
      
      expect(adapter.size()).toBe(0);
      expect(await adapter.get('pk1', 'sk1')).toBeNull();
    });

    it('does nothing for non-existent item', async () => {
      await adapter.delete('pk1', 'sk1');
      expect(adapter.size()).toBe(0);
    });
  });

  describe('queryBySortKeyPrefix', () => {
    it('returns items matching prefix', async () => {
      await adapter.put(createItem('pk1', 'user#1'));
      await adapter.put(createItem('pk1', 'user#2'));
      await adapter.put(createItem('pk1', 'task#1'));
      await adapter.put(createItem('pk2', 'user#1'));
      
      const results = await adapter.queryBySortKeyPrefix('pk1', 'user#');
      
      expect(results).toHaveLength(2);
      expect(results.map(r => r.SK).sort()).toStrictEqual(['user#1', 'user#2']);
    });

    it('returns empty array when no matches', async () => {
      await adapter.put(createItem('pk1', 'task#1'));
      
      const results = await adapter.queryBySortKeyPrefix('pk1', 'user#');
      
      expect(results).toStrictEqual([]);
    });
  });

  describe('clear', () => {
    it('removes all items', async () => {
      await adapter.put(createItem('pk1', 'sk1'));
      await adapter.put(createItem('pk2', 'sk2'));
      
      adapter.clear();
      
      expect(adapter.size()).toBe(0);
    });
  });

  describe('seed', () => {
    it('populates adapter with test data', () => {
      const items = [
        createItem('pk1', 'sk1'),
        createItem('pk2', 'sk2')
      ];
      
      adapter.seed(items);
      
      expect(adapter.size()).toBe(2);
    });
  });
});
