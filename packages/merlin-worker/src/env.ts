// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import type { WorkerConfig } from "./worker";

export function getQueueUrl(): string {
  return process.env.QUEUE_URL ?? "";
}

export function getBucketName(): string {
  return process.env.BUCKET_NAME ?? "";
}

export function getMerlinUrl(): string {
  return process.env.MERLIN_URL ?? "";
}

export function loadConfig(): WorkerConfig {
  return {
    queueUrl: getQueueUrl(),
    bucketName: getBucketName(),
    merlinUrl: getMerlinUrl(),
  };
}

export function validateConfig(config: WorkerConfig): string[] {
  const missing: string[] = [];
  if (!config.queueUrl) missing.push("QUEUE_URL");
  if (!config.bucketName) missing.push("BUCKET_NAME");
  if (!config.merlinUrl) missing.push("MERLIN_URL");
  return missing;
}
