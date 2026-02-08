// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';

import { handler } from './handler';
import { publishWarmMessage } from './sqs';

const region = process.env.AWS_REGION ?? 'eu-west-1';
const s3Client = new S3Client({ region });
const sqsClient = new SQSClient({ region });

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

function createResponse(statusCode: number, body: object): { statusCode: number; headers: typeof CORS_HEADERS; body: string } {
  return { statusCode, headers: { ...CORS_HEADERS }, body: JSON.stringify(body) };
}

export async function lambdaHandler(event: { body: string }): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  const response = await handler(event, s3Client, sqsClient);
  return { ...response, headers: { ...CORS_HEADERS } };
}

export async function healthHandler(): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  return createResponse(200, {
    status: 'healthy',
    service: 'audio-api',
    timestamp: new Date().toISOString(),
  });
}

export async function warmHandler(): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> {
  const queueUrl = process.env.QUEUE_URL ?? '';
  if (queueUrl === '') {
    return createResponse(500, { error: 'QUEUE_URL not configured' });
  }

  try {
    await publishWarmMessage(sqsClient, queueUrl);
    return createResponse(200, {
      status: 'warming',
      message: 'Audio worker warm-up triggered',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createResponse(500, {
      error: error instanceof Error ? error.message : 'Failed to trigger warm-up',
    });
  }
}

export { lambdaHandler as handler };
