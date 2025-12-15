import { getConfig } from '../src/config';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should compute S3 bucket name from environment', () => {
    process.env.ENV = 'dev';
    
    const config = getConfig();
    
    expect(config.bucketName).toBe('hak-audio-dev');
  });

  it('should compute SQS queue URL from environment', () => {
    process.env.ENV = 'prod';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCOUNT_ID = '123456789012';
    
    const config = getConfig();
    
    expect(config.queueUrl).toBe('https://sqs.us-east-1.amazonaws.com/123456789012/hak-audio-generation-prod');
  });

  it('should throw error when environment is missing', () => {
    delete process.env.ENV;
    
    expect(() => getConfig()).toThrow(/ENV environment variable is required/);
  });
});
