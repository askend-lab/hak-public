// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export { getAwsRegion } from "@hak/shared";

export function getRequiredEnvVars(): {
  bucketName: string;
  queueUrl: string;
} {
  const bucketName = process.env.BUCKET_NAME ?? "";
  const queueUrl = process.env.QUEUE_URL ?? "";
  if (bucketName === "" || queueUrl === "") {
    throw new Error(
      "BUCKET_NAME and QUEUE_URL environment variables are required",
    );
  }
  return { bucketName, queueUrl };
}


