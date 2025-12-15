import { handler } from '../src/handler';
import { MockS3Client, MockSQSClient } from './mocks';

describe('Lambda Handler - Cache Miss', () => {
  let mockS3: MockS3Client;
  let mockSQS: MockSQSClient;

  beforeEach(() => {
    mockS3 = new MockS3Client();
    mockSQS = new MockSQSClient();
    process.env.BUCKET_NAME = 'test-bucket';
    process.env.QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
  });

  it('should send SQS message when file not in S3', async () => {
    const event = {
      body: JSON.stringify({ text: 'new-phrase' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('new-phrase');
    mockS3.setFileExists(`cache/${hash}.mp3`, false);
    
    await handler(event, mockS3 as any, mockSQS as any);
    
    expect(mockSQS.messages).toHaveLength(1);
    const messageBody = JSON.parse(mockSQS.messages[0].MessageBody);
    expect(messageBody.text).toBe('new-phrase');
    expect(messageBody.hash).toBe(hash);
  });

  it('should return status processing with hash', async () => {
    const event = {
      body: JSON.stringify({ text: 'new-phrase' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('new-phrase');
    mockS3.setFileExists(`cache/${hash}.mp3`, false);
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('processing');
    expect(body.hash).toBe(hash);
  });

  it('should return hash for frontend polling', async () => {
    const event = {
      body: JSON.stringify({ text: 'test' })
    };
    
    const { calculateHash } = require('../src/hash');
    const hash = calculateHash('test');
    mockS3.setFileExists(`cache/${hash}.mp3`, false);
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    const body = JSON.parse(response.body);
    expect(body.hash).toBeDefined();
    expect(body.hash).toBe(hash);
    expect(body.url).toBeUndefined();
  });
});
