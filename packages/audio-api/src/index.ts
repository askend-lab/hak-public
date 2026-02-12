// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

import { handler as coreHandler } from "./handler";
import { publishWarmMessage } from "./sqs";
import {
  createResponse,
  extractErrorMessage,
  HTTP_STATUS,
  type LambdaResponse,
} from "./response";
import { getAwsRegion } from "./env";

const region = getAwsRegion();
const s3Client = new S3Client({ region });
const sqsClient = new SQSClient({ region });

export async function handler(
  event: { body: string },
): Promise<LambdaResponse> {
  return coreHandler(event, s3Client, sqsClient);
}

export { handler as lambdaHandler };

export async function healthHandler(): Promise<LambdaResponse> {
  return createResponse(HTTP_STATUS.OK, {
    status: "healthy",
    service: "audio-api",
    timestamp: new Date().toISOString(),
  });
}

export async function warmHandler(): Promise<LambdaResponse> {
  const queueUrl = process.env.QUEUE_URL ?? "";
  if (queueUrl === "") {
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: "QUEUE_URL not configured" });
  }

  try {
    await publishWarmMessage(sqsClient, queueUrl);
    return createResponse(HTTP_STATUS.OK, {
      status: "warming",
      message: "Audio worker warm-up triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: extractErrorMessage(error, "Failed to trigger warm-up"),
    });
  }
}
