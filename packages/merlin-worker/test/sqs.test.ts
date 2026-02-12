// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { receiveMessage, deleteMessage, parseMessage, isWarmMessage, MAX_MESSAGES, WAIT_TIME_SECONDS } from "../src/sqs";
import { createMockSqsClient } from "./setup";

const mockSqsClient = createMockSqsClient();

describe("SQS Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("receiveMessage", () => {
    it("should receive message from queue", async () => {
      const mockMessage = {
        MessageId: "msg-123",
        Body: JSON.stringify({ text: "tere", hash: "abc123" }),
        ReceiptHandle: "receipt-123",
      };

      mockSqsClient.send.mockResolvedValue({
        Messages: [mockMessage],
      });

      const result = await receiveMessage(mockSqsClient, "https://queue-url");

      expect(result).toStrictEqual(mockMessage);
      expect(mockSqsClient.send).toHaveBeenCalledTimes(1);
    });

    it("should return null when queue is empty", async () => {
      mockSqsClient.send.mockResolvedValue({
        Messages: [],
      });

      const result = await receiveMessage(mockSqsClient, "https://queue-url");

      expect(result).toBeNull();
    });

    it("should return null when Messages is undefined", async () => {
      mockSqsClient.send.mockResolvedValue({});

      const result = await receiveMessage(mockSqsClient, "https://queue-url");

      expect(result).toBeNull();
    });
  });

  describe("parseMessage", () => {
    it("should parse message body with text and hash", () => {
      const message = {
        Body: JSON.stringify({ text: "tere päevast", hash: "abc123def456" }),
      };

      const result = parseMessage(message);

      expect(result).toStrictEqual({
        text: "tere päevast",
        hash: "abc123def456",
      });
    });

    it("should parse warm message", () => {
      const message = {
        Body: JSON.stringify({ type: "warm", timestamp: Date.now() }),
      };

      const result = parseMessage(message);

      expect(result).toStrictEqual({ type: "warm" });
    });

    it("should throw error for invalid JSON", () => {
      const message = {
        Body: "invalid json",
      };

      expect(() => parseMessage(message as { Body: string })).toThrow();
    });

    it("should throw error for empty message body", () => {
      const message = {
        Body: "",
      };

      expect(() => parseMessage(message as { Body: string })).toThrow(
        "Message body is empty",
      );
    });

    it("should throw error for undefined message body", () => {
      const message = {};

      expect(() => parseMessage(message as { Body: string })).toThrow(
        "Message body is empty",
      );
    });

    it("should throw error for missing text field", () => {
      const message = {
        Body: JSON.stringify({ hash: "abc123" }),
      };

      expect(() => parseMessage(message as { Body: string })).toThrow(
        "Missing text field",
      );
    });

    it("should throw error for missing hash field", () => {
      const message = {
        Body: JSON.stringify({ text: "tere" }),
      };

      expect(() => parseMessage(message as { Body: string })).toThrow(
        "Missing hash field",
      );
    });
  });

  describe("deleteMessage", () => {
    it("should delete message from queue", async () => {
      mockSqsClient.send.mockResolvedValue({});

      await deleteMessage(mockSqsClient, "https://queue-url", "receipt-123");

      expect(mockSqsClient.send).toHaveBeenCalledTimes(1);
    });
  });

  describe("isWarmMessage", () => {
    it("should return true for warm message", () => {
      expect(isWarmMessage({ type: "warm" })).toBe(true);
    });

    it("should return false for audio message", () => {
      expect(isWarmMessage({ text: "hello", hash: "abc" })).toBe(false);
    });
  });

  describe("parseMessage edge cases", () => {
    it("should throw for empty text string", () => {
      const message = { Body: JSON.stringify({ text: "", hash: "abc" }) };
      expect(() => parseMessage(message as { Body: string })).toThrow("Missing text field");
    });

    it("should throw for empty hash string", () => {
      const message = { Body: JSON.stringify({ text: "hello", hash: "" }) };
      expect(() => parseMessage(message as { Body: string })).toThrow("Missing hash field");
    });

    it("should throw for numeric text", () => {
      const message = { Body: JSON.stringify({ text: 123, hash: "abc" }) };
      expect(() => parseMessage(message as { Body: string })).toThrow("Missing text field");
    });

    it("should throw for numeric hash", () => {
      const message = { Body: JSON.stringify({ text: "hello", hash: 123 }) };
      expect(() => parseMessage(message as { Body: string })).toThrow("Missing hash field");
    });
  });

  describe("SQS constants", () => {
    it("MAX_MESSAGES should be 1", () => {
      expect(MAX_MESSAGES).toBe(1);
    });

    it("WAIT_TIME_SECONDS should be 20", () => {
      expect(WAIT_TIME_SECONDS).toBe(20);
    });
  });
});
