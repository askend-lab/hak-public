// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export class MockS3Client {
  private readonly files = new Map<string, boolean>();
  public shouldThrow = false;

  setFileExists(key: string, exists: boolean): void {
    this.files.set(key, exists);
  }

  send(
    command: HeadObjectCommand | SendMessageCommand,
  ): Promise<
    { $metadata: { httpStatusCode: number } } | { MessageId: string }
  > {
    if (this.shouldThrow) {
      throw new Error("Mock S3 error");
    }
    if (command instanceof HeadObjectCommand) {
      const params = command.input;
      const exists = this.files.get(params.Key ?? "");
      if (exists === true) {
        return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
      }
      const error = new Error("Not Found") as Error & { name: string };
      error.name = "NotFound";
      throw error;
    }
    throw new Error(
      `Unknown command: ${command.constructor.name}`,
    );
  }

  reset(): void {
    this.files.clear();
  }
}

export class MockSQSClient {
  public messages: SendMessageCommand["input"][] = [];

  send(command: SendMessageCommand): Promise<{ MessageId: string }> {
    if (command instanceof SendMessageCommand) {
      this.messages.push(command.input);
      return Promise.resolve({ MessageId: "mock-message-id" });
    }
    throw new Error("Unknown command");
  }

  reset(): void {
    this.messages = [];
  }
}
