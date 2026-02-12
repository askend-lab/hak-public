// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { SQSClient } from "@aws-sdk/client-sqs";
import type { S3Client } from "@aws-sdk/client-s3";
import type { WorkerConfig } from "../src/worker";

export const TEST_QUEUE_URL = "https://queue-url";
export const TEST_BUCKET = "test-bucket";
export const TEST_MERLIN_URL = "https://merlin-url/synthesize";

export const TEST_CONFIG: WorkerConfig = {
  queueUrl: TEST_QUEUE_URL,
  bucketName: TEST_BUCKET,
  merlinUrl: TEST_MERLIN_URL,
};

export function createMockSqsClient(): SQSClient & { send: jest.Mock } {
  return { send: jest.fn() } as unknown as SQSClient & { send: jest.Mock };
}

export function createMockS3Client(): S3Client & { send: jest.Mock } {
  return { send: jest.fn() } as unknown as S3Client & { send: jest.Mock };
}

export function createMockMessage(body: object, overrides?: Partial<{ MessageId: string; ReceiptHandle: string }>) {
  return {
    MessageId: overrides?.MessageId ?? "msg-123",
    Body: JSON.stringify(body),
    ReceiptHandle: overrides?.ReceiptHandle ?? "receipt-123",
    ...overrides,
  };
}
