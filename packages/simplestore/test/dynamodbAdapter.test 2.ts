// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StoreItem } from "../src/core/types";
import { DynamoDBAdapter } from "../src/adapters/dynamodb";

// Mock the AWS SDK
const mockSend = jest.fn();
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
}));
jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: (): { send: jest.Mock } => ({ send: mockSend }),
  },
  PutCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  GetCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  DeleteCommand: jest.fn().mockImplementation((params) => ({ input: params })),
  QueryCommand: jest.fn().mockImplementation((params) => ({ input: params })),
}));

function makeItem(pk: string, sk: string): StoreItem {
  return {
    PK: pk,
    SK: sk,
    data: {},
    owner: "user1",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    ttl: 0,
  };
}

describe("DynamoDBAdapter", () => {
  let adapter: DynamoDBAdapter;
  const TABLE = "test-table";

  beforeEach(() => {
    jest.clearAllMocks();
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
});
