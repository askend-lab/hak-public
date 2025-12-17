import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { SendMessageCommand } from '@aws-sdk/client-sqs';

export class MockS3Client {
  private files = new Map<string, boolean>();

  setFileExists(key: string, exists: boolean) {
    this.files.set(key, exists);
  }

  async send(command: any) {
    if (command instanceof HeadObjectCommand) {
      const params = command.input;
      const exists = this.files.get(params.Key);
      if (exists) {
        return { $metadata: { httpStatusCode: 200 } };
      }
      const error: any = new Error('Not Found');
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
  public messages: any[] = [];

  async send(command: any) {
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
