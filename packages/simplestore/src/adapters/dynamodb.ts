// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * AWS DynamoDB storage adapter
 */

import { DynamoDBClient, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { StorageAdapter, StoreItem, UpsertFields } from "../core/types";

const SK_PREFIX_CONDITION = "PK = :pk AND begins_with(SK, :skPrefix)";

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
   * When expectedVersion is provided, uses conditional write for optimistic locking
   * @throws {VersionConflictError} when expectedVersion doesn't match stored version
   */
  async put(item: StoreItem, expectedVersion?: number): Promise<void> {
    try {
      if (expectedVersion !== undefined) {
        await this.docClient.send(
          new PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression:
              "attribute_not_exists(version) OR version = :expectedVersion",
            ExpressionAttributeValues: {
              ":expectedVersion": expectedVersion,
            },
          }),
        );
      } else {
        await this.docClient.send(
          new PutCommand({ TableName: this.tableName, Item: item }),
        );
      }
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new VersionConflictError(
          "Item was modified by another request. Please retry.",
        );
      }
      throw error;
    }
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
   * Atomic upsert — single DynamoDB call, no read-before-write
   * Uses if_not_exists for createdAt and atomic version increment
   */
  async upsert(pk: string, sk: string, fields: UpsertFields): Promise<StoreItem> {
    const now = new Date().toISOString();

    let updateExpr =
      "SET #data = :data, #owner = :owner, updatedAt = :now, " +
      "createdAt = if_not_exists(createdAt, :now), " +
      "version = if_not_exists(version, :zero) + :one";

    const exprValues: Record<string, unknown> = {
      ":data": fields.data,
      ":owner": fields.owner,
      ":now": now,
      ":zero": 0,
      ":one": 1,
    };

    if (fields.ttl !== undefined) {
      updateExpr += ", #ttl = :ttl";
      exprValues[":ttl"] = fields.ttl;
    } else {
      updateExpr += " REMOVE #ttl";
    }

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: this.dynamoKey(pk, sk),
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: {
          "#data": "data",
          "#owner": "owner",
          "#ttl": "ttl",
        },
        ExpressionAttributeValues: exprValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return result.Attributes as StoreItem;
  }

  async queryBySortKeyPrefix(
    pk: string,
    skPrefix: string,
    maxItems = 100,
  ): Promise<StoreItem[]> {
    const allItems: StoreItem[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    do {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: SK_PREFIX_CONDITION,
          ExpressionAttributeValues: {
            ":pk": pk,
            ":skPrefix": skPrefix,
          },
          ExclusiveStartKey: lastEvaluatedKey,
          Limit: Math.min(maxItems - allItems.length, 100),
        }),
      );

      allItems.push(...((result.Items ?? []) as StoreItem[]));

      if (maxItems !== undefined && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }

      lastEvaluatedKey = result.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (lastEvaluatedKey && allItems.length < maxItems);

    return allItems;
  }
}

export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionConflictError";
  }
}
