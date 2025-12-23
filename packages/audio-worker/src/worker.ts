import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

import { synthesize } from './merlin';
import { uploadAudio } from './s3';
import { receiveMessage, parseMessage, deleteMessage } from './sqs';

export interface WorkerConfig {
  queueUrl: string;
  bucketName: string;
  merlinUrl: string;
}

export async function processMessage(
  sqsClient: SQSClient,
  s3Client: S3Client,
  config: WorkerConfig
): Promise<boolean> {
  const message = await receiveMessage(sqsClient, config.queueUrl);
  
  if (!message) {
    return false;
  }

  try {
    const { text, hash } = parseMessage(message);
    console.log(`Processing: hash=${hash}, text="${text.substring(0, 50)}..."`);

    const audioBuffer = await synthesize(text, config.merlinUrl);
    console.log(`Synthesized: ${audioBuffer.length} bytes`);

    await uploadAudio(s3Client, config.bucketName, hash, audioBuffer);
    console.log(`Uploaded: cache/${hash}.mp3`);

    await deleteMessage(sqsClient, config.queueUrl, message.ReceiptHandle!);
    console.log(`Deleted message: ${message.MessageId}`);

    return true;
  } catch (error) {
    console.error(`Error processing message ${message.MessageId}:`, error);
    throw error;
  }
}

const ERROR_RETRY_DELAY_MS = 5000;

export async function runWorker(
  sqsClient: SQSClient,
  s3Client: S3Client,
  config: WorkerConfig,
  signal?: AbortSignal
): Promise<void> {
   
  console.log('Audio worker started');
   
  console.log(`Queue: ${config.queueUrl}`);
   
  console.log(`Bucket: ${config.bucketName}`);
   
  console.log(`Merlin: ${config.merlinUrl}`);

  while (signal?.aborted !== true) {
    try {
      await processMessage(sqsClient, s3Client, config);
    } catch (error) {
       
      console.error('Worker error:', error);
      await new Promise((resolve) => {
        setTimeout(resolve, ERROR_RETRY_DELAY_MS);
      });
    }
  }

   
  console.log('Audio worker stopped');
}
