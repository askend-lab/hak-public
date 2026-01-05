import { SendMessageCommand } from '@aws-sdk/client-sqs';

export interface SQSClientLike {
  send(command: SendMessageCommand): Promise<unknown>;
}

export async function publishToQueue(
  sqsClient: SQSClientLike,
  queueUrl: string,
  text: string,
  hash: string
): Promise<void> {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ text, hash, timestamp: Date.now() })
  });
  await sqsClient.send(command);
}
