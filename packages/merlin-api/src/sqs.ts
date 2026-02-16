// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getAwsRegion, getSqsQueueUrl } from "./env";

let _sqsClient: SQSClient | undefined;
function getSqsClient(): SQSClient {
  if (!_sqsClient) {
    _sqsClient = new SQSClient({ region: getAwsRegion() });
  }
  return _sqsClient;
}

export async function sendToQueue(message: object): Promise<string> {
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
