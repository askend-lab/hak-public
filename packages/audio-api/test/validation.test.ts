import { handler } from '../src/handler';

import {
  TestContext,
  createTestContext,
  setupTestEnv,
  createRequestEvent,
} from './setup';

describe('Input Validation', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  it('should reject empty text', async () => {
    const event = createRequestEvent('');
    
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Text field is required');
  });

  it('should reject missing text field', async () => {
    const event = { body: JSON.stringify({}) };
    
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
  });

  it('should reject text longer than max length', async () => {
    const event = createRequestEvent('a'.repeat(1001));
    
    const response = await handler(event, ctx.mockS3, ctx.mockSQS);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('too long');
  });
});
