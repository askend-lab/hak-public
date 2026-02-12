// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";

export interface AudioMessage {
  text: string;
  hash: string;
}

export interface WarmMessage {
  type: "warm";
}

export type ParsedMessage = AudioMessage | WarmMessage;

export function isWarmMessage(msg: ParsedMessage): msg is WarmMessage {
  return "type" in msg && msg.type === "warm";
}

export const MAX_MESSAGES = 1;
export const WAIT_TIME_SECONDS = 20;

export async function receiveMessage(
  client: SQSClient,
  queueUrl: string,
): Promise<Message | null> {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: MAX_MESSAGES,
    WaitTimeSeconds: WAIT_TIME_SECONDS,
  });

  const response = await client.send(command);

  const messages = response.Messages ?? [];
  if (messages.length === 0) {
    return null;
  }

  return messages[0] ?? null;
}

export interface MessageBody {
  type?: unknown;
  text?: unknown;
  hash?: unknown;
}

export function parseMessage(message: Message): ParsedMessage {
  const messageBody = message.Body ?? "";
  if (messageBody === "") {
    throw new Error("Message body is empty");
  }

  const body = JSON.parse(messageBody) as MessageBody;

  if (body.type === "warm") {
    return { type: "warm" };
  }

  if (typeof body.text !== "string" || body.text === "") {
    throw new Error("Missing text field");
  }

  if (typeof body.hash !== "string" || body.hash === "") {
    throw new Error("Missing hash field");
  }

  return {
    text: body.text,
    hash: body.hash,
  };
}

export async function deleteMessage(
  client: SQSClient,
  queueUrl: string,
  receiptHandle: string,
): Promise<void> {
  const command = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await client.send(command);
}
