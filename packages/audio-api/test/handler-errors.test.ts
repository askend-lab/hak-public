import type { S3Client } from '@aws-sdk/client-s3';
import type { SQSClient } from '@aws-sdk/client-sqs';

import { handler } from '../src/handler';

import {
  TestContext,
  createTestContext,
  createRequestEvent,
  TEST_BUCKET,
  TEST_QUEUE_URL,
} from './setup';

type S3Send = Pick<S3Client, 'send'>;
type SQSSend = Pick<SQSClient, 'send'>;

describe('Lambda Handler - Error Cases', () => {
  let ctx: TestContext;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    ctx = createTestContext();
    process.env.BUCKET_NAME = TEST_BUCKET;
    process.env.QUEUE_URL = TEST_QUEUE_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should return error when BUCKET_NAME is missing', async () => {
    delete process.env.BUCKET_NAME;
    const event = createRequestEvent('test');
    
    const response = await handler(event, ctx.mockS3 as unknown as S3Send, ctx.mockSQS as unknown as SQSSend);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('BUCKET_NAME');
  });

  it('should return error when QUEUE_URL is missing', async () => {
    delete process.env.QUEUE_URL;
    const event = createRequestEvent('test');
    
    const response = await handler(event, ctx.mockS3 as unknown as S3Send, ctx.mockSQS as unknown as SQSSend);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('QUEUE_URL');
  });

  it('should return error when both env vars are missing', async () => {
    delete process.env.BUCKET_NAME;
    delete process.env.QUEUE_URL;
    const event = createRequestEvent('test');
    
    const response = await handler(event, ctx.mockS3 as unknown as S3Send, ctx.mockSQS as unknown as SQSSend);
    
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBeDefined();
  });

  it('should handle invalid JSON in request body', async () => {
    const event = { body: 'not valid json' };
    
    const response = await handler(event, ctx.mockS3 as unknown as S3Send, ctx.mockSQS as unknown as SQSSend);
    
    expect(response.statusCode).toBe(400);
  });

  it('should handle S3 errors gracefully', async () => {
    const event = createRequestEvent('test');
    ctx.mockS3.shouldThrow = true;
    
    const response = await handler(event, ctx.mockS3 as unknown as S3Send, ctx.mockSQS as unknown as SQSSend);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
  });
});
