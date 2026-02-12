// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

import { handler } from "./handler";
import { publishWarmMessage } from "./sqs";
import {
  createResponse,
  extractErrorMessage,
  type LambdaResponse,
} from "./response";
import { getAwsRegion, getQueueUrl } from "./env";

const s3Client = new S3Client({ region: getAwsRegion() });
const sqsClient = new SQSClient({ region: getAwsRegion() });

export async function lambdaHandler(
  event: { body: string },
): Promise<LambdaResponse> {
  return handler(event, s3Client, sqsClient);
}

export async function healthHandler(): Promise<LambdaResponse> {
  return createResponse(200, {
    status: "healthy",
    service: "audio-api",
    timestamp: new Date().toISOString(),
  });
}

export async function warmHandler(): Promise<LambdaResponse> {
  const queueUrl = getQueueUrl();
  if (queueUrl === "") {
    return createResponse(500, { error: "QUEUE_URL not configured" });
  }

  try {
    await publishWarmMessage(sqsClient, queueUrl);
    return createResponse(200, {
      status: "warming",
      message: "Audio worker warm-up triggered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return createResponse(500, {
      error: extractErrorMessage(error, "Failed to trigger warm-up"),
    });
  }
}

export { lambdaHandler as handler };
