import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { handler } from './handler';

const region = process.env.AWS_REGION || 'eu-west-1';
const s3Client = new S3Client({ region });
const sqsClient = new SQSClient({ region });

export async function lambdaHandler(event: any): Promise<any> {
  const response = await handler(event, s3Client, sqsClient);
  return {
    ...response,
    headers: {
      ...response.headers,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  };
}

export async function healthHandler(): Promise<any> {
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
