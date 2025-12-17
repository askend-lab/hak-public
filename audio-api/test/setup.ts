import { MockS3Client, MockSQSClient } from './mocks';
import { calculateHash } from '../src/hash';

export const TEST_BUCKET = 'test-bucket';
export const TEST_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';

export interface TestContext {
  mockS3: MockS3Client;
  mockSQS: MockSQSClient;
}

export function createTestContext(): TestContext {
  return {
    mockS3: new MockS3Client(),
    mockSQS: new MockSQSClient(),
  };
}

export function setupTestEnv(): void {
  process.env.BUCKET_NAME = TEST_BUCKET;
  process.env.QUEUE_URL = TEST_QUEUE_URL;
}

export function setupCacheHit(mockS3: MockS3Client, text: string): string {
  const hash = calculateHash(text);
  mockS3.setFileExists(`cache/${hash}.mp3`, true);
  return hash;
}

export function setupCacheMiss(mockS3: MockS3Client, text: string): string {
  const hash = calculateHash(text);
  mockS3.setFileExists(`cache/${hash}.mp3`, false);
  return hash;
}

export function createRequestEvent(text: string): { body: string } {
  return { body: JSON.stringify({ text }) };
}
