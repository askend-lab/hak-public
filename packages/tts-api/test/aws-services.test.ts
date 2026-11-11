// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { setupTestEnv, setupEcsEnv } from "./setup";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-ecs", () => {
  return {
    ECSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
    DescribeServicesCommand: jest.fn().mockImplementation((input) => ({ input, _type: "DescribeServices" })),
    UpdateServiceCommand: jest.fn().mockImplementation((input) => ({ input, _type: "UpdateService" })),
  };
});

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    HeadObjectCommand: jest.fn().mockImplementation((input) => ({ input, _type: "HeadObject" })),
  };
});

jest.mock("@aws-sdk/client-sqs", () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
    SendMessageCommand: jest.fn().mockImplementation((input) => ({ input, _type: "SendMessage" })),
    GetQueueAttributesCommand: jest.fn().mockImplementation((input) => ({ input, _type: "GetQueueAttributes" })),
  };
});

beforeEach(() => {
  setupTestEnv();
  setupEcsEnv();
  mockSend.mockReset();
});

describe("ecs", () => {
  const { describeService, scaleService, isEcsConfigured } = require("../src/ecs");

  describe("isEcsConfigured", () => {
    it("should return true when ECS env vars are set", () => {
      expect(isEcsConfigured()).toBe(true);
    });

    it("should return false when ECS env vars are missing", () => {
      delete process.env.ECS_CLUSTER;
      delete process.env.ECS_SERVICE;
      expect(isEcsConfigured()).toBe(false);
    });
  });

  describe("describeService", () => {
    it("should return desired and running counts", async () => {
      mockSend.mockResolvedValue({
        services: [{ desiredCount: 2, runningCount: 1 }],
      });

      const result = await describeService();
      expect(result).toStrictEqual({ desired: 2, running: 1 });
    });

    it("should return 0 when services array is empty", async () => {
      mockSend.mockResolvedValue({ services: [] });

      const result = await describeService();
      expect(result).toStrictEqual({ desired: 0, running: 0 });
    });

    it("should return 0 when services is undefined", async () => {
      mockSend.mockResolvedValue({});

      const result = await describeService();
      expect(result).toStrictEqual({ desired: 0, running: 0 });
    });
  });

  describe("scaleService", () => {
    it("should send UpdateServiceCommand with desired count", async () => {
      mockSend.mockResolvedValue({});

      await scaleService(3);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({ desiredCount: 3 }),
        }),
      );
    });
  });
});

describe("s3", () => {
  const { checkS3Cache, buildCacheKey, buildAudioUrl } = require("../src/s3");
  const { isNotFoundError } = require("../src/s3");

  describe("buildCacheKey", () => {
    it("should build cache key with .wav extension", () => {
      expect(buildCacheKey("abc123")).toBe("cache/abc123.wav");
    });
  });

  describe("buildAudioUrl", () => {
    it("should build full S3 URL", () => {
      const url = buildAudioUrl("abc123");
      expect(url).toContain("test-bucket");
      expect(url).toContain("cache/abc123.wav");
    });
  });

  describe("checkS3Cache", () => {
    it("should return true when object exists", async () => {
      mockSend.mockResolvedValue({});

      const result = await checkS3Cache("abc123");
      expect(result).toBe(true);
    });

    it("should return false when NotFound error", async () => {
      mockSend.mockRejectedValue({ name: "NotFound" });

      const result = await checkS3Cache("abc123");
      expect(result).toBe(false);
    });

    it("should return false when NoSuchKey error", async () => {
      mockSend.mockRejectedValue({ name: "NoSuchKey" });

      const result = await checkS3Cache("abc123");
      expect(result).toBe(false);
    });

    it("should return false when 404 status code", async () => {
      mockSend.mockRejectedValue({ $metadata: { httpStatusCode: 404 } });

      const result = await checkS3Cache("abc123");
      expect(result).toBe(false);
    });

    it("should rethrow non-NotFound errors", async () => {
      mockSend.mockRejectedValue({ name: "AccessDenied", message: "forbidden", $metadata: { httpStatusCode: 403 } });

      await expect(checkS3Cache("abc123")).rejects.toThrow("S3 error");
    });
  });

  describe("isNotFoundError", () => {
    it("should return false for null", () => {
      expect(isNotFoundError(null)).toBe(false);
    });

    it("should return false for non-object", () => {
      expect(isNotFoundError("string")).toBe(false);
    });

    it("should return true for NotFound name", () => {
      expect(isNotFoundError({ name: "NotFound" })).toBe(true);
    });

    it("should return true for NoSuchKey name", () => {
      expect(isNotFoundError({ name: "NoSuchKey" })).toBe(true);
    });

    it("should return true for 404 metadata", () => {
      expect(isNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(true);
    });

    it("should return false for other errors", () => {
      expect(isNotFoundError({ name: "InternalError" })).toBe(false);
    });
  });
});

describe("sqs", () => {
  const { sendToQueue, QueueFullError } = require("../src/sqs");

  describe("sendToQueue", () => {
    it("should send message and return MessageId", async () => {
      mockSend
        .mockResolvedValueOnce({ Attributes: { ApproximateNumberOfMessages: "5" } })
        .mockResolvedValueOnce({ MessageId: "msg-456" });

      const result = await sendToQueue({ text: "hello" });
      expect(result).toBe("msg-456");
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it("should throw when MessageId is undefined", async () => {
      mockSend
        .mockResolvedValueOnce({ Attributes: { ApproximateNumberOfMessages: "0" } })
        .mockResolvedValueOnce({});

      await expect(sendToQueue({ text: "hello" })).rejects.toThrow(
        "SQS SendMessage did not return a MessageId",
      );
    });

    it("should throw QueueFullError when queue depth >= 50", async () => {
      mockSend.mockResolvedValueOnce({ Attributes: { ApproximateNumberOfMessages: "55" } });

      await expect(sendToQueue({ text: "hello" })).rejects.toThrow(QueueFullError);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });
});
