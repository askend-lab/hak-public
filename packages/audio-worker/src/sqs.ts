/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-redundant-type-constituents -- AWS SDK types */
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';

export interface AudioMessage {
  text: string;
  hash: string;
}

export async function receiveMessage(
  client: SQSClient,
  queueUrl: string
): Promise<Message | null> {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20,
  });

  const response = await client.send(command);
  
  const messages = response.Messages ?? [];
  if (messages.length === 0) {
    return null;
  }

  return messages[0] ?? null;
}

interface MessageBody {
  text?: unknown;
  hash?: unknown;
}

export function parseMessage(message: Message): AudioMessage {
  const messageBody = message.Body ?? '';
  if (messageBody === '') {
    throw new Error('Message body is empty');
  }

  const body = JSON.parse(messageBody) as MessageBody;

  if (typeof body.text !== 'string' || body.text === '') {
    throw new Error('Missing text field');
  }

  if (typeof body.hash !== 'string' || body.hash === '') {
    throw new Error('Missing hash field');
  }

  return {
    text: body.text,
    hash: body.hash,
  };
}

export async function deleteMessage(
  client: SQSClient,
  queueUrl: string,
  receiptHandle: string
): Promise<void> {
  const command = new DeleteMessageCommand({
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  });

  await client.send(command);
}
