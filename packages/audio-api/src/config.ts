// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * @deprecated This config is not used. Use BUCKET_NAME and QUEUE_URL env vars directly.
 * Kept for reference but should be removed in future cleanup.
 */
export interface Config {
  bucketName: string;
  queueUrl: string;
}
