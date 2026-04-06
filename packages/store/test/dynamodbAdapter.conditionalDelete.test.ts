// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { StoreItem } from "../src/core/types";
import { DynamoDBAdapter } from "../src/adapters/dynamodb";
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

describe("dynamodbAdapter: conditionalDelete", () => {
  let adapter: DynamoDBAdapter;
  const TABLE = "test-table";

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new DynamoDBAdapter(TABLE);
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
