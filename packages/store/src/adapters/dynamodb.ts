// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/* eslint-disable max-classes-per-file -- VersionConflictError is tightly coupled to DynamoDBAdapter */

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

export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionConflictError";
  }
}

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

  private buildPutCommand(item: StoreItem, expectedVersion?: number): PutCommand {
    if (expectedVersion !== undefined) {
      return new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression:
          "attribute_not_exists(version) OR version = :expectedVersion",
        ExpressionAttributeValues: {
          ":expectedVersion": expectedVersion,
        },
      });
    }
    return new PutCommand({
      TableName: this.tableName,
      Item: item,
      ConditionExpression: "attribute_not_exists(PK)",
    });
  }

  /**
   * Stores an item in DynamoDB
   * When expectedVersion is provided, uses conditional write for optimistic locking
   * @throws {VersionConflictError} when expectedVersion doesn't match stored version
   */
  async put(item: StoreItem, expectedVersion?: number): Promise<void> {
    try {
      await this.docClient.send(this.buildPutCommand(item, expectedVersion));
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
   * Atomic conditional delete — single DynamoDB call with owner check
   * Returns status string instead of throwing for expected conditions
   */
  async conditionalDelete(pk: string, sk: string, expectedOwner: string): Promise<"deleted" | "not_found" | "not_owner"> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: this.dynamoKey(pk, sk),
          ConditionExpression: "attribute_exists(PK) AND #owner = :expectedOwner",
          ExpressionAttributeNames: { "#owner": "owner" },
          ExpressionAttributeValues: { ":expectedOwner": expectedOwner },
        }),
      );
      return "deleted";
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        const item = await this.get(pk, sk);
        return item ? "not_owner" : "not_found";
      }
      throw error;
    }
  }

  private buildUpsertCommand(
    pk: string,
    sk: string,
    fields: UpsertFields,
  ): UpdateCommand {
    const now = new Date().toISOString();
    const baseExpr =
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
    const updateExpr = fields.ttl !== undefined
      ? (exprValues[":ttl"] = fields.ttl, `${baseExpr}, #ttl = :ttl`)
      : `${baseExpr} REMOVE #ttl`;
    return new UpdateCommand({
      TableName: this.tableName,
      Key: this.dynamoKey(pk, sk),
      UpdateExpression: updateExpr,
      ExpressionAttributeNames: { "#data": "data", "#owner": "owner", "#ttl": "ttl" },
      ExpressionAttributeValues: exprValues,
      ReturnValues: "ALL_NEW",
    });
  }

  /**
   * Atomic upsert — single DynamoDB call, no read-before-write
   * Uses if_not_exists for createdAt and atomic version increment
   */
  async upsert(pk: string, sk: string, fields: UpsertFields): Promise<StoreItem> {
    const result = await this.docClient.send(
      this.buildUpsertCommand(pk, sk, fields),
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
      const result = await this.docClient.send( // eslint-disable-line no-await-in-loop -- DynamoDB pagination requires sequential requests
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

/* eslint-enable max-classes-per-file -- end DynamoDB adapter file */
