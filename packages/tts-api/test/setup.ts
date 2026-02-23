// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { SynthesizeEvent, StatusEvent } from "../src/handler";

export const TEST_REGION = "eu-west-1";
export const TEST_BUCKET = "test-bucket";
export const TEST_QUEUE_URL = "https://sqs.eu-west-1.amazonaws.com/123456789/test-queue";
const TEST_ECS_CLUSTER = "test-cluster";
const TEST_ECS_SERVICE = "test-service";
export const DEFAULT_VOICE = "efm_l";
export const DEFAULT_SPEED = 1.0;
export const DEFAULT_PITCH = 0;

export function setupTestEnv(): void {
  process.env.AWS_REGION = TEST_REGION;
  process.env.S3_BUCKET = TEST_BUCKET;
  process.env.SQS_QUEUE_URL = TEST_QUEUE_URL;
  delete process.env.ECS_CLUSTER;
  delete process.env.ECS_SERVICE;
}

export function setupEcsEnv(): void {
  process.env.ECS_CLUSTER = TEST_ECS_CLUSTER;
  process.env.ECS_SERVICE = TEST_ECS_SERVICE;
}

export function createRequestEvent(text: string): SynthesizeEvent {
  return { body: JSON.stringify({ text }) };
}

export function createStatusEvent(cacheKey?: string): StatusEvent {
  return { pathParameters: cacheKey ? { cacheKey } : undefined };
}
