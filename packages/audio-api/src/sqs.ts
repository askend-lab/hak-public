import { SendMessageCommand, type SQSClient } from '@aws-sdk/client-sqs';

export async function publishToQueue(
  sqsClient: Pick<SQSClient, 'send'>,
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
