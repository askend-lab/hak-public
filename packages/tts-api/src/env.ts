// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export function getAwsRegion(): string {
  return process.env.AWS_REGION ?? "eu-west-1";
}

export function getSqsQueueUrl(): string {
  const url = process.env.SQS_QUEUE_URL;
  if (!url) {
    throw new Error("Missing required environment variable: SQS_QUEUE_URL");
  }
  return url;
}

const VALID_BUCKET_NAME = /^[a-z0-9][a-z0-9.\-]{1,61}[a-z0-9]$/;

export function getS3Bucket(): string {
  const bucket = process.env.S3_BUCKET ?? "";
  if (!VALID_BUCKET_NAME.test(bucket)) {
    throw new Error(`Invalid or missing S3_BUCKET: "${bucket}"`);
  }
  return bucket;
}

export function getEcsCluster(): string {
  const cluster = process.env.ECS_CLUSTER;
  if (!cluster) {
    throw new Error("Missing required environment variable: ECS_CLUSTER");
  }
  return cluster;
}

export function getEcsService(): string {
  const service = process.env.ECS_SERVICE;
  if (!service) {
    throw new Error("Missing required environment variable: ECS_SERVICE");
  }
  return service;
}

export const VOICE_DEFAULTS = {
  voice: "efm_l",
  speed: 1.0,
  pitch: 0,
} as const;
