import { DynamoDBClient } from './store';
import { StoreItem } from './types';

/**
 * In-memory store implementing DynamoDBClient interface
 * For testing without AWS dependencies - provides test isolation
 */
export class InMemoryStore implements DynamoDBClient {
  private readonly data: Map<string, StoreItem> = new Map();

  private buildKey(pk: string, sk: string): string {
    return `${pk}#${sk}`;
  }

  async put(item: StoreItem): Promise<void> {
    const key = this.buildKey(item.PK, item.SK);
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

  async queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
    const results: StoreItem[] = [];
    
    for (const [_key, item] of this.data) {
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
