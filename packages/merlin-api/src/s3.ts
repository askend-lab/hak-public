// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getAwsRegion, getS3Bucket } from "./env";

const s3Client = new S3Client({ region: getAwsRegion() });

interface S3Error {
  name?: string;
  $metadata?: { httpStatusCode?: number };
}

const NOT_FOUND_STATUS = 404;

export function buildCacheKey(cacheKey: string): string {
  return `cache/${cacheKey}.wav`;
}

export function buildAudioUrl(cacheKey: string): string {
  return `https://${getS3Bucket()}.s3.${getAwsRegion()}.amazonaws.com/${buildCacheKey(cacheKey)}`;
}

export async function checkS3Cache(cacheKey: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: getS3Bucket(),
        Key: buildCacheKey(cacheKey),
      }),
    );
    return true;
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as S3Error;
  return (
    err.name === "NotFound" ||
    err.name === "NoSuchKey" ||
    err.$metadata?.httpStatusCode === NOT_FOUND_STATUS
  );
}
