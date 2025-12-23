import { DynamoDBClient } from '../src/store';
import { StoreItem } from '../src/types';

export class InMemoryDynamoDB implements DynamoDBClient {
  private readonly items = new Map<string, StoreItem>();

  private makeKey(pk: string, sk: string): string {
    return `${pk}|${sk}`;
  }

  async put(item: StoreItem): Promise<void> {
    const key = this.makeKey(item.PK, item.SK);
    this.items.set(key, { ...item });
  }

  async get(pk: string, sk: string): Promise<StoreItem | null> {
    const key = this.makeKey(pk, sk);
    const item = this.items.get(key);
    return item ? { ...item } : null;
  }

  async delete(pk: string, sk: string): Promise<void> {
    const key = this.makeKey(pk, sk);
    this.items.delete(key);
  }

  async queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
    const results: StoreItem[] = [];
    for (const item of this.items.values()) {
      if (item.PK === pk && item.SK.startsWith(skPrefix)) {
        results.push({ ...item });
      }
    }
    return results;
  }

  clear(): void {
    this.items.clear();
  }

  size(): number {
    return this.items.size;
  }
}
