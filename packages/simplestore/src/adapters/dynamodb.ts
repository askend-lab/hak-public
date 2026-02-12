// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * AWS DynamoDB storage adapter
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { StorageAdapter, StoreItem } from "../core/types";

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

  private dynamoKey(pk: string, sk: string): Record<string, string> {
    return { PK: pk, SK: sk };
  }

  /**
   * Stores an item in DynamoDB
   */
  async put(item: StoreItem): Promise<void> {
    await this.docClient.send(
      new PutCommand({ TableName: this.tableName, Item: item }),
    );
  }

  /**
   * Retrieves an item by primary key
   */
  async get(pk: string, sk: string): Promise<StoreItem | null> {
    const result = await this.docClient.send(
      new GetCommand({ TableName: this.tableName, Key: this.dynamoKey(pk, sk) }),
    );

    return (result.Item as StoreItem) ?? null;
  }

  /**
   * Deletes an item by primary key
   */
  async delete(pk: string, sk: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({ TableName: this.tableName, Key: this.dynamoKey(pk, sk) }),
    );
  }

  /**
   * Queries items by partition key with sort key prefix
   * Uses begins_with for efficient prefix matching
   * Handles pagination to return all matching items
   */
  async queryBySortKeyPrefix(
    pk: string,
    skPrefix: string,
  ): Promise<StoreItem[]> {
    const allItems: StoreItem[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": pk,
            ":skPrefix": skPrefix,
          },
          ExclusiveStartKey: lastEvaluatedKey,
        }),
      );

      allItems.push(...((result.Items ?? []) as StoreItem[]));
      lastEvaluatedKey = result.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (lastEvaluatedKey);

    return allItems;
  }
}
