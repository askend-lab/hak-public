export class MockS3Client {
  private files = new Map<string, boolean>();

  setFileExists(key: string, exists: boolean) {
    this.files.set(key, exists);
  }

  async headObject(params: { Bucket: string; Key: string }) {
    const exists = this.files.get(params.Key);
    if (exists) {
      return { $metadata: { httpStatusCode: 200 } };
    }
    const error: any = new Error('Not Found');
    error.name = 'NotFound';
    throw error;
  }

  reset() {
    this.files.clear();
  }
}

export class MockSQSClient {
  public messages: any[] = [];

  async sendMessage(params: any) {
    this.messages.push(params);
    return { MessageId: 'mock-message-id' };
  }

  reset() {
    this.messages = [];
  }
}
