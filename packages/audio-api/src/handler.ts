// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { S3ClientLike } from "./s3";
import type { SQSClientLike } from "./sqs";
import { TEXT_LIMITS, calculateHashSync as calculateHash } from "@hak/shared";

import { checkFileExists, buildS3Url } from "./s3";
import { publishToQueue } from "./sqs";
import {
  createErrorResponse,
  createSuccessResponse,
  extractErrorMessage,
  type LambdaResponse,
} from "./response";
import { getAwsRegion, getRequiredEnvVars } from "./env";

interface RequestBody {
  text?: unknown;
}

function buildCacheKey(hash: string): string {
  return `cache/${hash}.mp3`;
}

export function validateText(
  text: unknown,
): { valid: true; text: string } | { valid: false; error: string } {
  if (typeof text !== "string" || text === "") {
    return { valid: false, error: "Text field is required" };
  }
  if (text.length > TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text is too long (max ${String(TEXT_LIMITS.MAX_AUDIO_TEXT_LENGTH)} characters)`,
    };
  }
  return { valid: true, text };
}

export async function handler(
  event: { body: string },
  s3Client: S3ClientLike,
  sqsClient: SQSClientLike,
): Promise<LambdaResponse> {
  try {
    const { bucketName, queueUrl } = getRequiredEnvVars();

    const body = JSON.parse(event.body) as RequestBody;
    const validation = validateText(body.text);

    if (!validation.valid) {
      return createErrorResponse(validation.error);
    }

    const hash = calculateHash(validation.text);
    const key = buildCacheKey(hash);

    const exists = await checkFileExists(s3Client, bucketName, key);

    if (exists) {
      return createSuccessResponse({
        status: "ready",
        url: buildS3Url(bucketName, getAwsRegion(), key),
        hash,
      });
    }

    await publishToQueue(sqsClient, queueUrl, validation.text, hash);

    return createSuccessResponse({
      status: "processing",
      hash,
    });
  } catch (error: unknown) {
    return createErrorResponse(
      extractErrorMessage(error, "Unknown error occurred"),
    );
  }
}
