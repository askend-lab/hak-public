import { checkFileExists } from '../src/s3';

import { MockS3Client } from './mocks';

describe('S3 Cache Check', () => {
  let mockS3: MockS3Client;

  beforeEach(() => {
    mockS3 = new MockS3Client();
  });

  it('should return true when file exists', async () => {
    mockS3.setFileExists('cache/abc123.mp3', true);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exists = await checkFileExists(mockS3 as any, 'test-bucket', 'cache/abc123.mp3');
    
    expect(exists).toBe(true);
  });

  it('should return false when file does not exist', async () => {
    mockS3.setFileExists('cache/abc123.mp3', false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exists = await checkFileExists(mockS3 as any, 'test-bucket', 'cache/abc123.mp3');
    
    expect(exists).toBe(false);
  });

  it('should throw error on connection errors', async () => {
    const mockS3WithError = {
      send: (): never => {
        const error = new Error('Connection timeout') as Error & { name: string };
        error.name = 'NetworkError';
        throw error;
      }
    };
    
    await expect(checkFileExists(mockS3WithError, 'test-bucket', 'cache/abc123.mp3'))
      .rejects.toThrow('Connection timeout');
  });
});
