// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

import type { S3ClientLike } from "../src/s3";
import type { SQSClientLike } from "../src/sqs";

export class MockS3Client implements S3ClientLike {
  private readonly files = new Map<string, boolean>();
  public shouldThrow = false;

  setFileExists(key: string, exists: boolean): void {
    this.files.set(key, exists);
  }

  send(
    command: HeadObjectCommand,
  ): Promise<{ $metadata: { httpStatusCode: number } }> {
    if (this.shouldThrow) {
      throw new Error("Mock S3 error");
    }
    const exists = this.files.get(command.input.Key ?? "");
    if (exists === true) {
      return Promise.resolve({ $metadata: { httpStatusCode: 200 } });
    }
    const error = new Error("Not Found") as Error & { name: string };
    error.name = "NotFound";
    throw error;
  }
}

export class MockSQSClient implements SQSClientLike {
  public messages: SendMessageCommand["input"][] = [];

  send(command: SendMessageCommand): Promise<{ MessageId: string }> {
    this.messages.push(command.input);
    return Promise.resolve({ MessageId: "mock-message-id" });
  }
}
