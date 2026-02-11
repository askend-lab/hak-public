// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { publishToQueue, publishWarmMessage } from "../src/sqs";

import { MockSQSClient } from "./mocks";

describe("SQS Message Publishing", () => {
  let mockSQS: MockSQSClient;

  beforeEach(() => {
    mockSQS = new MockSQSClient();
  });

  it("should send SQS message with correct payload", async () => {
    const queueUrl = "https://sqs.us-east-1.amazonaws.com/123456789/test-queue";
    const text = "tere";
    const hash = "abc123";

    await publishToQueue(mockSQS, queueUrl, text, hash);

    expect(mockSQS.messages).toHaveLength(1);
    expect(mockSQS.messages[0]?.QueueUrl).toBe(queueUrl);

    const messageBody = JSON.parse(mockSQS.messages[0]?.MessageBody ?? "{}");
    expect(messageBody.text).toBe(text);
    expect(messageBody.hash).toBe(hash);
  });

  it("should include all required fields in message", async () => {
    const queueUrl = "https://sqs.us-east-1.amazonaws.com/123456789/test-queue";
    const text = "tere";
    const hash = "abc123";

    await publishToQueue(mockSQS, queueUrl, text, hash);

    const messageBody = JSON.parse(mockSQS.messages[0]?.MessageBody ?? "{}");
    expect(messageBody.text).toBeDefined();
    expect(messageBody.hash).toBeDefined();
    expect(messageBody.timestamp).toBeDefined();
    expect(typeof messageBody.timestamp).toBe("number");
  });

  it("should handle publish errors", async () => {
    const mockSQSWithError = {
      send: (): never => {
        throw new Error("Queue not found");
      },
    };

    await expect(
      publishToQueue(mockSQSWithError, "invalid-queue", "tere", "abc123"),
    ).rejects.toThrow("Queue not found");
  });
});

describe("SQS Warm Message", () => {
  it("should send warm message with correct payload", async () => {
    const mockSQS = new MockSQSClient();
    const queueUrl = "https://sqs.us-east-1.amazonaws.com/123456789/test-queue";

    await publishWarmMessage(mockSQS, queueUrl);

    expect(mockSQS.messages).toHaveLength(1);
    expect(mockSQS.messages[0]?.QueueUrl).toBe(queueUrl);

    const body = JSON.parse(mockSQS.messages[0]?.MessageBody ?? "{}");
    expect(body.type).toBe("warm");
    expect(body.timestamp).toBeDefined();
  });

  it("should handle warm message errors", async () => {
    const mockSQSWithError = {
      send: (): never => {
        throw new Error("Queue unavailable");
      },
    };

    await expect(
      publishWarmMessage(mockSQSWithError, "invalid-queue"),
    ).rejects.toThrow("Queue unavailable");
  });
});
