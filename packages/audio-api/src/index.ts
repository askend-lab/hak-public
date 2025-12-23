/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument -- AWS SDK and process.env */
import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

import { handler } from './handler';

const region = (process.env.AWS_REGION as string | undefined) ?? 'eu-west-1';
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

export { lambdaHandler as handler };
