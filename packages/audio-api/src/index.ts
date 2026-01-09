import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

import { handler } from './handler';
import { publishWarmMessage } from './sqs';

const region = process.env.AWS_REGION ?? 'eu-west-1';
const s3Client = new S3Client({ region });
const sqsClient = new SQSClient({ region });

export async function lambdaHandler(event: { body: string }): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  const response = await handler(event, s3Client, sqsClient);
  return {
    ...response,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  };
}

export function healthHandler(): { statusCode: number; body: string; headers: Record<string, string> } {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'healthy',
      service: 'audio-api',
      timestamp: new Date().toISOString(),
    }),
  };
}

export async function warmHandler(): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  const queueUrl = process.env.QUEUE_URL ?? '';
  if (queueUrl === '') {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'QUEUE_URL not configured' }),
    };
  }

  try {
    await publishWarmMessage(sqsClient, queueUrl);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        status: 'warming',
        message: 'Audio worker warm-up triggered',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to trigger warm-up',
      }),
    };
  }
}

export { lambdaHandler as handler };
