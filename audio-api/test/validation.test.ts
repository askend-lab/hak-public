import { handler } from '../src/handler';
import { MockS3Client, MockSQSClient } from './mocks';

describe('Input Validation', () => {
  let mockS3: MockS3Client;
  let mockSQS: MockSQSClient;

  beforeEach(() => {
    mockS3 = new MockS3Client();
    mockSQS = new MockSQSClient();
    process.env.BUCKET_NAME = 'test-bucket';
    process.env.QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
  });

  it('should reject empty text', async () => {
    const event = {
      body: JSON.stringify({ text: '' })
    };
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Text field is required');
  });

  it('should reject missing text field', async () => {
    const event = {
      body: JSON.stringify({})
    };
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();
  });

  it('should reject text longer than max length', async () => {
    const event = {
      body: JSON.stringify({ text: 'a'.repeat(1001) })
    };
    
    const response = await handler(event, mockS3 as any, mockSQS as any);
    
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('too long');
  });
});
