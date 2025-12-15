import { handler } from '../src/handler';
import { MockS3Client, MockSQSClient } from './mocks';

describe('Lambda Handler - Cache Hit', () => {
  let mockS3: MockS3Client;
  let mockSQS: MockSQSClient;

  beforeEach(() => {
    mockS3 = new MockS3Client();
    mockSQS = new MockSQSClient();
    process.env.BUCKET_NAME = 'test-bucket';
    process.env.QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
  });

  it('should return URL when file exists in S3', async () => {
    const event = {
      body: JSON.stringify({ text: 'tere' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('tere');
    mockS3.setFileExists(`cache/${hash}.mp3`, true);
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ready');
    expect(body.url).toContain('test-bucket');
    expect(body.url).toContain('.mp3');
    expect(body.hash).toBe(hash);
  });

  it('should have correct URL format with status ready', async () => {
    const event = {
      body: JSON.stringify({ text: 'hello' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('hello');
    mockS3.setFileExists(`cache/${hash}.mp3`, true);
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ready');
    expect(body.url).toBe(`https://test-bucket.s3.amazonaws.com/cache/${hash}.mp3`);
    expect(body.hash).toBe(hash);
  });

  it('should NOT send SQS message on cache hit', async () => {
    const event = {
      body: JSON.stringify({ text: 'tere' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('tere');
    mockS3.setFileExists(`cache/${hash}.mp3`, true);
    
    await handler(event, mockS3 as any, mockSQS as any);
    
    expect(mockSQS.messages).toHaveLength(0);
  });
});
