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
  
  if (!response.Messages || response.Messages.length === 0) {
    return null;
  }

  return response.Messages[0];
}

export function parseMessage(message: Message): AudioMessage {
  if (!message.Body) {
    throw new Error('Message body is empty');
  }

  const body = JSON.parse(message.Body);

  if (!body.text) {
    throw new Error('Missing text field');
  }

  if (!body.hash) {
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
