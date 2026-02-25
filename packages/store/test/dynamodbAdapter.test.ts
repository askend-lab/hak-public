// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StoreItem } from "../src/core/types";
import { DynamoDBAdapter, VersionConflictError } from "../src/adapters/dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import type { Mock } from "vitest";

// Mock the AWS SDK — mockSend must be declared via vi.hoisted so it's available inside vi.mock factories
const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-dynamodb", () => {
  class ConditionalCheckFailedException extends Error {
    override readonly name = "ConditionalCheckFailedException" as const;
    readonly $metadata = {};
    constructor(opts: { message: string; $metadata: Record<string, unknown> }) {
      super(opts.message);
    }
  }
  class DynamoDBClient {
    send = mockSend;
  }
  return { DynamoDBClient, ConditionalCheckFailedException };
});
vi.mock("@aws-sdk/lib-dynamodb", () => {
  function makeCmd(params: unknown): { input: unknown } {
    return { input: params };
  }
  class PutCommand { input: unknown; constructor(p: unknown) { this.input = (makeCmd(p)).input; } }
  class GetCommand { input: unknown; constructor(p: unknown) { this.input = (makeCmd(p)).input; } }
  class DeleteCommand { input: unknown; constructor(p: unknown) { this.input = (makeCmd(p)).input; } }
  class QueryCommand { input: unknown; constructor(p: unknown) { this.input = (makeCmd(p)).input; } }
  class UpdateCommand { input: unknown; constructor(p: unknown) { this.input = (makeCmd(p)).input; } }
  return {
    DynamoDBDocumentClient: {
      from: (): { send: Mock } => ({ send: mockSend }),
    },
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
    UpdateCommand,
  };
});

function makeItem(pk: string, sk: string, version = 1): StoreItem {
  return {
    PK: pk,
    SK: sk,
    data: {},
    owner: "user1",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    version,
    ttl: 0,
  };
}

describe("DynamoDBAdapter", () => {
  let adapter: DynamoDBAdapter;
  const TABLE = "test-table";

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new DynamoDBAdapter(TABLE);
  });

  describe("put", () => {
    it("should send PutCommand with correct params", async () => {
      mockSend.mockResolvedValue({});
      const item = makeItem("user#1", "task#1");

      await adapter.put(item);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.input.TableName).toBe(TABLE);
      expect(call.input.Item).toStrictEqual(item);
    });

    it("should add ConditionExpression when expectedVersion is provided", async () => {
      mockSend.mockResolvedValue({});
      const item = makeItem("user#1", "task#1", 2);

      await adapter.put(item, 1);

      const call = mockSend.mock.calls[0][0];
      expect(call.input.ConditionExpression).toContain("version = :expectedVersion");
      expect(call.input.ExpressionAttributeValues).toStrictEqual({ ":expectedVersion": 1 });
    });

    it("should add attribute_not_exists(PK) condition on first insert (no expectedVersion)", async () => {
      mockSend.mockResolvedValue({});
      const item = makeItem("user#1", "task#1");

      await adapter.put(item);

      const call = mockSend.mock.calls[0][0];
      expect(call.input.ConditionExpression).toBe("attribute_not_exists(PK)");
    });

    it("should throw VersionConflictError on ConditionalCheckFailedException", async () => {
      mockSend.mockRejectedValue(
        new (ConditionalCheckFailedException as unknown as new (opts: { message: string; $metadata: Record<string, unknown> }) => Error)({ message: "condition", $metadata: {} }),
      );
      const item = makeItem("user#1", "task#1", 2);

      await expect(adapter.put(item, 1)).rejects.toThrow(VersionConflictError);
    });

    it("should throw VersionConflictError on concurrent first insert (write skew protection)", async () => {
      mockSend.mockRejectedValue(
        new (ConditionalCheckFailedException as unknown as new (opts: { message: string; $metadata: Record<string, unknown> }) => Error)({ message: "condition", $metadata: {} }),
      );
      const item = makeItem("user#1", "task#1");

      await expect(adapter.put(item)).rejects.toThrow(VersionConflictError);
    });
  });

  describe("get", () => {
    it("should return item when found", async () => {
      const item = makeItem("user#1", "task#1");
      mockSend.mockResolvedValue({ Item: item });

      const result = await adapter.get("user#1", "task#1");

      expect(result).toStrictEqual(item);
    });

    it("should return null when not found", async () => {
      mockSend.mockResolvedValue({});

      const result = await adapter.get("user#1", "missing");

      expect(result).toBeNull();
    });

    it("should send GetCommand with correct Key", async () => {
      mockSend.mockResolvedValue({});

      await adapter.get("user#1", "task#1");

      const call = mockSend.mock.calls[0][0];
      expect(call.input.TableName).toBe(TABLE);
      expect(call.input.Key).toStrictEqual({ PK: "user#1", SK: "task#1" });
    });
  });

  describe("delete", () => {
    it("should send DeleteCommand with correct Key", async () => {
      mockSend.mockResolvedValue({});

      await adapter.delete("user#1", "task#1");

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.input.TableName).toBe(TABLE);
      expect(call.input.Key).toStrictEqual({ PK: "user#1", SK: "task#1" });
    });
  });

  describe("queryBySortKeyPrefix", () => {
    it("should return matching items", async () => {
      const items = [
        makeItem("user#1", "task#1"),
        makeItem("user#1", "task#2"),
      ];
      mockSend.mockResolvedValue({ Items: items });

      const result = await adapter.queryBySortKeyPrefix("user#1", "task#");

      expect(result).toStrictEqual(items);
    });

    it("should send QueryCommand with correct params", async () => {
      mockSend.mockResolvedValue({ Items: [] });

      await adapter.queryBySortKeyPrefix("user#1", "task#");

      const call = mockSend.mock.calls[0][0];
      expect(call.input.TableName).toBe(TABLE);
      expect(call.input.KeyConditionExpression).toContain("PK = :pk");
      expect(call.input.KeyConditionExpression).toContain("begins_with");
      expect(call.input.ExpressionAttributeValues).toStrictEqual({
        ":pk": "user#1",
        ":skPrefix": "task#",
      });
    });

    it("should handle pagination", async () => {
      mockSend
        .mockResolvedValueOnce({
          Items: [makeItem("user#1", "task#1")],
          LastEvaluatedKey: { PK: "user#1", SK: "task#1" },
        })
        .mockResolvedValueOnce({ Items: [makeItem("user#1", "task#2")] });

      const result = await adapter.queryBySortKeyPrefix("user#1", "task#");

      expect(result).toHaveLength(2);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it("should return empty array when no items", async () => {
      mockSend.mockResolvedValue({ Items: [] });

      const result = await adapter.queryBySortKeyPrefix("user#1", "task#");

      expect(result).toStrictEqual([]);
    });
  });

  describe("upsert", () => {
    it("should send UpdateCommand with correct params", async () => {
      mockSend.mockResolvedValue({ Attributes: makeItem("pk1", "sk1") });

      await adapter.upsert("pk1", "sk1", { data: { foo: "bar" }, owner: "user1" });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];
      expect(call.input.TableName).toBe(TABLE);
      expect(call.input.Key).toStrictEqual({ PK: "pk1", SK: "sk1" });
      expect(call.input.UpdateExpression).toContain("if_not_exists(createdAt");
      expect(call.input.UpdateExpression).toContain("if_not_exists(version");
      expect(call.input.ReturnValues).toBe("ALL_NEW");
    });

    it("should include ttl when provided", async () => {
      mockSend.mockResolvedValue({ Attributes: { ...makeItem("pk1", "sk1"), ttl: 9999 } });

      await adapter.upsert("pk1", "sk1", { data: {}, owner: "user1", ttl: 9999 });

      const call = mockSend.mock.calls[0][0];
      expect(call.input.UpdateExpression).toContain("#ttl = :ttl");
      expect(call.input.ExpressionAttributeValues[":ttl"]).toBe(9999);
    });

    it("should REMOVE ttl when not provided", async () => {
      mockSend.mockResolvedValue({ Attributes: makeItem("pk1", "sk1") });

      await adapter.upsert("pk1", "sk1", { data: {}, owner: "user1" });

      const call = mockSend.mock.calls[0][0];
      expect(call.input.UpdateExpression).toContain("REMOVE #ttl");
    });

    it("should return the upserted item", async () => {
      const item = makeItem("pk1", "sk1");
      mockSend.mockResolvedValue({ Attributes: item });

      const result = await adapter.upsert("pk1", "sk1", { data: {}, owner: "user1" });

      expect(result).toStrictEqual(item);
    });
  });

  describe("conditionalDelete", () => {
    it("should return 'deleted' on success", async () => {
      mockSend.mockResolvedValue({});

      const result = await adapter.conditionalDelete("pk1", "sk1", "user1");
      expect(result).toBe("deleted");
    });

    it("should return 'not_owner' when item exists but owner differs", async () => {
      const MockedError = ConditionalCheckFailedException as unknown as new (opts: { message: string; $metadata: Record<string, unknown> }) => Error;
      mockSend
        .mockRejectedValueOnce(new MockedError({ message: "fail", $metadata: {} }))
        .mockResolvedValueOnce({ Item: makeItem("pk1", "sk1") });

      const result = await adapter.conditionalDelete("pk1", "sk1", "wrong-user");
      expect(result).toBe("not_owner");
    });

    it("should return 'not_found' when item does not exist", async () => {
      const MockedError = ConditionalCheckFailedException as unknown as new (opts: { message: string; $metadata: Record<string, unknown> }) => Error;
      mockSend
        .mockRejectedValueOnce(new MockedError({ message: "fail", $metadata: {} }))
        .mockResolvedValueOnce({ Item: undefined });

      const result = await adapter.conditionalDelete("pk1", "sk1", "user1");
      expect(result).toBe("not_found");
    });

    it("should rethrow non-conditional errors", async () => {
      mockSend.mockRejectedValue(new Error("DynamoDB down"));

      await expect(adapter.conditionalDelete("pk1", "sk1", "user1")).rejects.toThrow("DynamoDB down");
    });
  });
});
