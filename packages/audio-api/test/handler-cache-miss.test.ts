// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { handler } from '../src/handler';

import {
  TestContext,
  createTestContext,
  setupTestEnv,
  setupCacheMiss,
  createRequestEvent,
} from './setup';

describe('Lambda Handler - Cache Miss', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  it('should send SQS message when file not in S3', async () => {
    const event = createRequestEvent('new-phrase');
    const hash = setupCacheMiss(ctx.mockS3, 'new-phrase');
    
    await handler(event, ctx.mockS3, ctx.mockSQS);
    
    expect(ctx.mockSQS.messages).toHaveLength(1);
    const messageBody = JSON.parse(ctx.mockSQS.messages[0].MessageBody ?? '{}');
    expect(messageBody.text).toBe('new-phrase');
    expect(messageBody.hash).toBe(hash);
  });

  it('should return status processing with hash', async () => {
    const event = createRequestEvent('new-phrase');
    const hash = setupCacheMiss(ctx.mockS3, 'new-phrase');
    
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('processing');
    expect(body.hash).toBe(hash);
  });

  it('should return hash for frontend polling', async () => {
    const event = createRequestEvent('test');
    const hash = setupCacheMiss(ctx.mockS3, 'test');
    
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    
    const body = JSON.parse(response.body);
    expect(body.hash).toBeDefined();
    expect(body.hash).toBe(hash);
    expect(body.url).toBeUndefined();
  });
});
