// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { SendMessageCommand } from "@aws-sdk/client-sqs";

export interface SQSClientLike {
  send(command: SendMessageCommand): Promise<unknown>;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 100;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  /* istanbul ignore next -- unreachable: loop always returns or throws */
  throw new Error("Retry failed");
}

async function sendSqsMessage(
  sqsClient: SQSClientLike,
  queueUrl: string,
  body: Record<string, unknown>,
): Promise<void> {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ ...body, timestamp: Date.now() }),
  });
  await withRetry(() => sqsClient.send(command));
}

export async function publishToQueue(
  sqsClient: SQSClientLike,
  queueUrl: string,
  text: string,
  hash: string,
): Promise<void> {
  await sendSqsMessage(sqsClient, queueUrl, { text, hash });
}

export async function publishWarmMessage(
  sqsClient: SQSClientLike,
  queueUrl: string,
): Promise<void> {
  await sendSqsMessage(sqsClient, queueUrl, { type: "warm" });
}
