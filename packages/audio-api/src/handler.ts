 
import type { S3Client } from '@aws-sdk/client-s3';
import type { SQSClient } from '@aws-sdk/client-sqs';

import { calculateHash } from './hash';
import { checkFileExists } from './s3';
import { publishToQueue } from './sqs';

const MAX_TEXT_LENGTH = 1000;
const SUCCESS_STATUS_CODE = 200;
const MAX_STATUS_CODE = 400;

interface RequestBody {
  text?: unknown;
}

export async function handler(
  event: { body: string },
  s3Client: Pick<S3Client, 'send'>,
  sqsClient: Pick<SQSClient, 'send'>
): Promise<{ statusCode: number; body: string }> {
  try {
    const bucketName = process.env.BUCKET_NAME ?? '';
    const queueUrl = process.env.QUEUE_URL ?? '';
    
    if (bucketName === '' || queueUrl === '') {
      throw new Error('BUCKET_NAME and QUEUE_URL environment variables are required');
    }
    
    const body = JSON.parse(event.body) as RequestBody;
    const text = body.text;
    
    if (typeof text !== 'string' || text === '') {
      return {
        statusCode: MAX_STATUS_CODE,
        body: JSON.stringify({
          error: 'Text field is required'
        })
      };
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        statusCode: MAX_STATUS_CODE,
        body: JSON.stringify({
          error: `Text is too long (max ${String(MAX_TEXT_LENGTH)} characters)`
        })
      };
    }
    
    const hash = calculateHash(text);
    const key = `cache/${hash}.mp3`;
    
    const exists = await checkFileExists(s3Client, bucketName, key);
    
    if (exists) {
      return {
        statusCode: SUCCESS_STATUS_CODE,
        body: JSON.stringify({
          status: 'ready',
          url: `https://${bucketName}.s3.amazonaws.com/${key}`,
          hash
        })
      };
    }
    
    await publishToQueue(sqsClient, queueUrl, text, hash);
    
    return {
      statusCode: SUCCESS_STATUS_CODE,
      body: JSON.stringify({
        status: 'processing',
        hash
      })
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      statusCode: MAX_STATUS_CODE,
      body: JSON.stringify({
        error: errorMessage
      })
    };
  }
}
