// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { synthesize } from "../src/merlin";
import { uploadAudio } from "../src/s3";
import {
  receiveMessage,
  parseMessage,
  deleteMessage,
  isWarmMessage,
} from "../src/sqs";
import { processMessage, getReceiptHandle, getMessageId, TEXT_PREVIEW_LENGTH } from "../src/worker";
import {
  createMockSqsClient,
  createMockS3Client,
  createMockMessage,
  TEST_CONFIG,
} from "./setup";

jest.mock("../src/sqs", () => ({
  receiveMessage: jest.fn(),
  parseMessage: jest.fn(),
  deleteMessage: jest.fn(),
  isWarmMessage: jest.fn(),
}));

jest.mock("../src/merlin", () => ({
  synthesize: jest.fn(),
}));

jest.mock("../src/s3", () => ({
  uploadAudio: jest.fn(),
}));

const mockSqsClient = createMockSqsClient();
const mockS3Client = createMockS3Client();
const config = TEST_CONFIG;

describe("Worker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  describe("processMessage", () => {
    it("should return false when no message in queue", async () => {
      (receiveMessage as jest.Mock).mockResolvedValue(null);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(false);
      expect(synthesize).not.toHaveBeenCalled();
    });

    it("should process message end-to-end", async () => {
      const mockMessage = createMockMessage({ text: "tere", hash: "abc123" });
      const mockAudioBuffer = Buffer.from("fake audio");

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({
        text: "tere",
        hash: "abc123",
      });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(false);
      (synthesize as jest.Mock).mockResolvedValue(mockAudioBuffer);
      (uploadAudio as jest.Mock).mockResolvedValue(undefined);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
      expect(parseMessage).toHaveBeenCalledWith(mockMessage);
      expect(synthesize).toHaveBeenCalledWith("tere", config.merlinUrl);
      expect(uploadAudio).toHaveBeenCalledWith(
        mockS3Client,
        config.bucketName,
        "abc123",
        mockAudioBuffer,
      );
      expect(deleteMessage).toHaveBeenCalledWith(
        mockSqsClient,
        config.queueUrl,
        "receipt-123",
      );
    });

    it("should handle warm message without synthesizing", async () => {
      const mockMessage = {
        MessageId: "msg-warm",
        Body: JSON.stringify({ type: "warm", timestamp: Date.now() }),
        ReceiptHandle: "receipt-warm",
      };

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({ type: "warm" });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(true);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
      expect(synthesize).not.toHaveBeenCalled();
      expect(uploadAudio).not.toHaveBeenCalled();
      expect(deleteMessage).toHaveBeenCalledWith(
        mockSqsClient,
        config.queueUrl,
        "receipt-warm",
      );
    });

    it("should throw error when synthesis fails", async () => {
      const mockMessage = {
        MessageId: "msg-123",
        Body: JSON.stringify({ text: "tere", hash: "abc123" }),
        ReceiptHandle: "receipt-123",
      };

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({
        text: "tere",
        hash: "abc123",
      });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(false);
      (synthesize as jest.Mock).mockRejectedValue(new Error("TTS failed"));

      await expect(
        processMessage(mockSqsClient, mockS3Client, config),
      ).rejects.toThrow("TTS failed");
    });

    it("should handle message with undefined ReceiptHandle", async () => {
      const mockMessage = {
        MessageId: "msg-no-receipt",
        Body: JSON.stringify({ text: "tere", hash: "abc123" }),
      };
      const mockAudioBuffer = Buffer.from("fake audio");

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({
        text: "tere",
        hash: "abc123",
      });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(false);
      (synthesize as jest.Mock).mockResolvedValue(mockAudioBuffer);
      (uploadAudio as jest.Mock).mockResolvedValue(undefined);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
      expect(deleteMessage).toHaveBeenCalledWith(
        mockSqsClient,
        config.queueUrl,
        "",
      );
    });

    it("should handle message with undefined MessageId", async () => {
      const mockMessage = {
        Body: JSON.stringify({ text: "tere", hash: "abc123" }),
        ReceiptHandle: "receipt-123",
      };
      const mockAudioBuffer = Buffer.from("fake audio");

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({
        text: "tere",
        hash: "abc123",
      });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(false);
      (synthesize as jest.Mock).mockResolvedValue(mockAudioBuffer);
      (uploadAudio as jest.Mock).mockResolvedValue(undefined);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
    });

    it("should handle warm message with undefined ReceiptHandle", async () => {
      const mockMessage = {
        MessageId: "msg-warm",
        Body: JSON.stringify({ type: "warm" }),
      };

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({ type: "warm" });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(true);
      (deleteMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await processMessage(mockSqsClient, mockS3Client, config);

      expect(result).toBe(true);
      expect(deleteMessage).toHaveBeenCalledWith(
        mockSqsClient,
        config.queueUrl,
        "",
      );
    });

    it("should handle error with undefined MessageId", async () => {
      const mockMessage = createMockMessage(
        { text: "tere", hash: "abc123" },
        { MessageId: undefined as unknown as string },
      );
      delete (mockMessage as Record<string, unknown>).MessageId;

      (receiveMessage as jest.Mock).mockResolvedValue(mockMessage);
      (parseMessage as jest.Mock).mockReturnValue({
        text: "tere",
        hash: "abc123",
      });
      (isWarmMessage as unknown as jest.Mock).mockReturnValue(false);
      (synthesize as jest.Mock).mockRejectedValue(new Error("TTS failed"));

      await expect(
        processMessage(mockSqsClient, mockS3Client, config),
      ).rejects.toThrow("TTS failed");
    });
  });

  describe("getReceiptHandle", () => {
    it("should return ReceiptHandle when present", () => {
      const msg = { ReceiptHandle: "receipt-abc" };
      expect(getReceiptHandle(msg)).toBe("receipt-abc");
    });

    it("should return empty string when undefined", () => {
      expect(getReceiptHandle({})).toBe("");
    });
  });

  describe("getMessageId", () => {
    it("should return MessageId when present", () => {
      const msg = { MessageId: "msg-abc" };
      expect(getMessageId(msg)).toBe("msg-abc");
    });

    it("should return 'unknown' when undefined", () => {
      expect(getMessageId({})).toBe("unknown");
    });
  });

  describe("TEXT_PREVIEW_LENGTH", () => {
    it("should be 50", () => {
      expect(TEXT_PREVIEW_LENGTH).toBe(50);
    });
  });
});
