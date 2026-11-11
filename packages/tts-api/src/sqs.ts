// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { SQSClient, SendMessageCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { getAwsRegion, getSqsQueueUrl } from "./env";

let _sqsClient: SQSClient | undefined;
function getSqsClient(): SQSClient {
  if (!_sqsClient) {
    _sqsClient = new SQSClient({ region: getAwsRegion() });
  }
  return _sqsClient;
}

const MAX_QUEUE_DEPTH = 50; // PUB-4: reject requests when queue is too deep

export class QueueFullError extends Error {
  constructor(depth: number) {
    super(`Service temporarily unavailable: queue depth ${depth} exceeds limit ${MAX_QUEUE_DEPTH}`);
    this.name = "QueueFullError";
  }
}

async function checkQueueDepth(): Promise<number> {
  const result = await getSqsClient().send(
    new GetQueueAttributesCommand({
      QueueUrl: getSqsQueueUrl(),
      AttributeNames: ["ApproximateNumberOfMessages"],
    }),
  );
  return parseInt(result.Attributes?.ApproximateNumberOfMessages ?? "0", 10);
}

export async function sendToQueue(message: object): Promise<string> {
  const depth = await checkQueueDepth();
  if (depth >= MAX_QUEUE_DEPTH) {
    throw new QueueFullError(depth);
  }

  const result = await getSqsClient().send(
    new SendMessageCommand({
      QueueUrl: getSqsQueueUrl(),
      MessageBody: JSON.stringify(message),
    }),
  );
  if (!result.MessageId) {
    throw new Error("SQS SendMessage did not return a MessageId");
  }
  return result.MessageId;
}
