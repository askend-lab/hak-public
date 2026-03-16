// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getAwsRegion, getSqsQueueUrl } from "./env";

const sqsClient = new SQSClient({ region: getAwsRegion() });

export async function sendToQueue(message: object): Promise<string> {
  const result = await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: getSqsQueueUrl(),
      MessageBody: JSON.stringify(message),
    }),
  );
  return result.MessageId ?? "";
}
