// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getAwsRegion, getS3Bucket } from "./env";

interface S3Error {
  name?: string;
  message?: string;
  code?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}

function isS3Error(error: unknown): error is S3Error {
  return (
    typeof error === "object" &&
    error !== null &&
    ("name" in error || "$metadata" in error)
  );
}

export function isNotFoundError(error: unknown): boolean {
  if (!isS3Error(error)) return false;
  return (
    error.name === "NotFound" ||
    error.name === "NoSuchKey" ||
    error.$metadata?.httpStatusCode === 404
  );
}

function buildS3Url(bucketName: string, region: string, key: string): string {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

async function checkFileExists(
  s3Client: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return false;
    }
    if (!isS3Error(error)) {
      throw new Error(`Unknown S3 error: ${String(error)}`);
    }
    throw new Error(
      `S3 error: ${JSON.stringify({
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.$metadata?.httpStatusCode,
        bucket,
        key,
      })}`,
    );
  }
}

const s3Client = new S3Client({ region: getAwsRegion() });

export function buildCacheKey(cacheKey: string): string {
  return `cache/${cacheKey}.wav`;
}

export function buildAudioUrl(cacheKey: string): string {
  return buildS3Url(getS3Bucket(), getAwsRegion(), buildCacheKey(cacheKey));
}

export async function checkS3Cache(cacheKey: string): Promise<boolean> {
  return checkFileExists(s3Client, getS3Bucket(), buildCacheKey(cacheKey));
}
