/**
 * AWS DynamoDB storage adapter
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { StorageAdapter, StoreItem } from '../core/types';

/**
 * AWS DynamoDB adapter implementing StorageAdapter interface
 * Provides actual DynamoDB operations for production use
 */
export class DynamoDBAdapter implements StorageAdapter {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(tableName: string, client?: DynamoDBClient) {
    const dynamoClient = client ?? new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName = tableName;
  }

  /**
   * Stores an item in DynamoDB
   */
  async put(item: StoreItem): Promise<void> {
    await this.docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: item
    }));
  }

  /**
   * Retrieves an item by primary key
   */
  async get(pk: string, sk: string): Promise<StoreItem | null> {
    const result = await this.docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk }
    }));
     
    return (result.Item as StoreItem) ?? null;
  }

  /**
   * Deletes an item by primary key
   */
  async delete(pk: string, sk: string): Promise<void> {
    await this.docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { PK: pk, SK: sk }
    }));
  }

  /**
   * Queries items by partition key with sort key prefix
   * Uses begins_with for efficient prefix matching
   */
  async queryBySortKeyPrefix(pk: string, skPrefix: string): Promise<StoreItem[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': pk,
        ':skPrefix': skPrefix
      }
    }));
    return (result.Items ?? []) as StoreItem[];
  }
}
