/* eslint-disable @typescript-eslint/no-unsafe-call -- AWS SDK SQS operations */
import { SendMessageCommand, type SQSClient } from '@aws-sdk/client-sqs';

export async function publishToQueue(
  sqsClient: Pick<SQSClient, 'send'>,
  queueUrl: string,
  text: string,
  hash: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- AWS SDK command construction
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ text, hash, timestamp: Date.now() })
  });
  await sqsClient.send(command);
}
