import type { S3ClientLike } from './s3';
import type { SQSClientLike } from './sqs';
import { TEXT_LIMITS } from '@hak/shared';

import { calculateHashSync as calculateHash } from '@hak/shared';
import { checkFileExists } from './s3';
import { publishToQueue } from './sqs';

const MAX_TEXT_LENGTH = TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH;

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400
} as const;

interface RequestBody {
  text?: unknown;
}

interface ApiResponse {
  statusCode: number;
  body: string;
}

function createResponse(statusCode: number, body: unknown): ApiResponse {
  return { statusCode, body: JSON.stringify(body) };
}

function createErrorResponse(error: string): ApiResponse {
  return createResponse(HTTP_STATUS.BAD_REQUEST, { error });
}

function createSuccessResponse(body: unknown): ApiResponse {
  return createResponse(HTTP_STATUS.OK, body);
}

function validateText(text: unknown): { valid: true; text: string } | { valid: false; error: string } {
  if (typeof text !== 'string' || text === '') {
    return { valid: false, error: 'Text field is required' };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Text is too long (max ${String(MAX_TEXT_LENGTH)} characters)` };
  }
  return { valid: true, text };
}

function getRequiredEnvVars(): { bucketName: string; queueUrl: string } {
  const bucketName = process.env.BUCKET_NAME ?? '';
  const queueUrl = process.env.QUEUE_URL ?? '';
  if (bucketName === '' || queueUrl === '') {
    throw new Error('BUCKET_NAME and QUEUE_URL environment variables are required');
  }
  return { bucketName, queueUrl };
}

export async function handler(
  event: { body: string },
  s3Client: S3ClientLike,
  sqsClient: SQSClientLike
): Promise<{ statusCode: number; body: string }> {
  try {
    const { bucketName, queueUrl } = getRequiredEnvVars();
    
    const body = JSON.parse(event.body) as RequestBody;
    const validation = validateText(body.text);
    
    if (!validation.valid) {
      return createErrorResponse(validation.error);
    }
    
    const text = validation.text;
    
    const hash = calculateHash(text);
    const key = `cache/${hash}.mp3`;
    
    const exists = await checkFileExists(s3Client, bucketName, key);
    
    if (exists) {
      return createSuccessResponse({
        status: 'ready',
        url: `https://${bucketName}.s3.${process.env.AWS_REGION ?? 'eu-west-1'}.amazonaws.com/${key}`,
        hash
      });
    }
    
    await publishToQueue(sqsClient, queueUrl, text, hash);
    
    return createSuccessResponse({
      status: 'processing',
      hash
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return createErrorResponse(errorMessage);
  }
}
