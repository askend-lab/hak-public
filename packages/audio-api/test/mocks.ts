/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/require-await -- Test mocks */
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export class MockS3Client {
  private readonly files = new Map<string, boolean>();

  setFileExists(key: string, exists: boolean) {
    this.files.set(key, exists);
  }

  async send(command: HeadObjectCommand | SendMessageCommand): Promise<{ $metadata: { httpStatusCode: number } } | { MessageId: string }> {
    if (command instanceof HeadObjectCommand) {
      const params = command.input;
      const exists = this.files.get(params.Key);
      if (exists) {
        return { $metadata: { httpStatusCode: 200 } };
      }
      const error = new Error('Not Found') as Error & { name: string };
      error.name = 'NotFound';
      throw error;
    }
    throw new Error(`Unknown command: ${command.constructor.name}`);
  }

  reset() {
    this.files.clear();
  }
}

export class MockSQSClient {
  public messages: SendMessageCommand['input'][] = [];

  async send(command: SendMessageCommand): Promise<{ MessageId: string }> {
    if (command instanceof SendMessageCommand) {
      this.messages.push(command.input);
      return { MessageId: 'mock-message-id' };
    }
    throw new Error(`Unknown command: ${command.constructor.name}`);
  }

  reset() {
    this.messages = [];
  }
}
