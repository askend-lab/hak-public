export async function publishToQueue(
  sqsClient: any,
  queueUrl: string,
  text: string,
  hash: string
): Promise<void> {
  const messageBody = JSON.stringify({
    text,
    hash,
    timestamp: Date.now()
  });

  await sqsClient.sendMessage({
    QueueUrl: queueUrl,
    MessageBody: messageBody
  });
}
