import { handler } from '../src/handler';
import {
  TestContext,
  createTestContext,
  setupTestEnv,
  setupCacheHit,
  createRequestEvent,
  TEST_BUCKET,
} from './setup';

describe('Lambda Handler - Cache Hit', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
    setupTestEnv();
  });

  it('should return URL when file exists in S3', async () => {
    const event = createRequestEvent('tere');
    const hash = setupCacheHit(ctx.mockS3, 'tere');
    
    const response = await handler(event, ctx.mockS3 as any, ctx.mockSQS as any);
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ready');
    expect(body.url).toContain(TEST_BUCKET);
    expect(body.url).toContain('.mp3');
    expect(body.hash).toBe(hash);
  });

  it('should have correct URL format with status ready', async () => {
    const event = createRequestEvent('hello');
    const hash = setupCacheHit(ctx.mockS3, 'hello');
    
    const response = await handler(event, ctx.mockS3 as any, ctx.mockSQS as any);
    
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ready');
    expect(body.url).toBe(`https://${TEST_BUCKET}.s3.amazonaws.com/cache/${hash}.mp3`);
    expect(body.hash).toBe(hash);
  });

  it('should NOT send SQS message on cache hit', async () => {
    const event = createRequestEvent('tere');
    setupCacheHit(ctx.mockS3, 'tere');
    
    await handler(event, ctx.mockS3 as any, ctx.mockSQS as any);
    
    expect(ctx.mockSQS.messages).toHaveLength(0);
  });
});
