// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { createLogger } from "@hak/shared";

import { synthesize } from "./merlin";
import { uploadAudio } from "./s3";
import {
  receiveMessage,
  parseMessage,
  deleteMessage,
  isWarmMessage,
} from "./sqs";
import type { Message } from "@aws-sdk/client-sqs";

const logger = createLogger("info");

function getReceiptHandle(message: Message): string {
  return message.ReceiptHandle ?? "";
}

function getMessageId(message: Message): string {
  return message.MessageId ?? "unknown";
}

export interface WorkerConfig {
  queueUrl: string;
  bucketName: string;
  merlinUrl: string;
}

export async function processMessage(
  sqsClient: SQSClient,
  s3Client: S3Client,
  config: WorkerConfig,
): Promise<boolean> {
  const message = await receiveMessage(sqsClient, config.queueUrl);

  if (!message) {
    return false;
  }

  try {
    const parsed = parseMessage(message);

    if (isWarmMessage(parsed)) {
      logger.info("Received warm-up message, acknowledging and continuing");
      await deleteMessage(
        sqsClient,
        config.queueUrl,
        getReceiptHandle(message),
      );
      return true;
    }

    const { text, hash } = parsed;
    logger.info(`Processing: hash=${hash}, text="${text.substring(0, 50)}..."`);

    const audioBuffer = await synthesize(text, config.merlinUrl);
    logger.info(`Synthesized: ${String(audioBuffer.length)} bytes`);

    await uploadAudio(s3Client, config.bucketName, hash, audioBuffer);
    logger.info(`Uploaded: cache/${hash}.mp3`);

    await deleteMessage(
      sqsClient,
      config.queueUrl,
      getReceiptHandle(message),
    );
    logger.info(`Deleted message: ${getMessageId(message)}`);

    return true;
  } catch (error) {
    logger.error(
      `Error processing message ${getMessageId(message)}:`,
      error,
    );
    throw error;
  }
}

const ERROR_RETRY_DELAY_MS = 5000;

/* istanbul ignore next */
export async function runWorker(
  sqsClient: SQSClient,
  s3Client: S3Client,
  config: WorkerConfig,
  signal?: AbortSignal,
): Promise<void> {
  logger.info("Audio worker started");
  logger.info(`Queue: ${config.queueUrl}`);
  logger.info(`Bucket: ${config.bucketName}`);
  logger.info(`Merlin: ${config.merlinUrl}`);

  while (signal?.aborted !== true) {
    try {
      await processMessage(sqsClient, s3Client, config);
    } catch (error) {
      logger.error("Worker error:", error);
      await new Promise((resolve) => {
        setTimeout(resolve, ERROR_RETRY_DELAY_MS);
      });
    }
  }

  logger.info("Audio worker stopped");
}
