// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Shared S3 utilities used by merlin-api.
 */

import { HeadObjectCommand } from "@aws-sdk/client-s3";

export interface S3ClientLike {
  send(command: HeadObjectCommand): Promise<unknown>;
}

interface S3Error {
  name?: string;
  message?: string;
  code?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}

const NOT_FOUND_STATUS = 404;

function isS3Error(error: unknown): error is S3Error {
  return (
    typeof error === "object" &&
    error !== null &&
    ("name" in error || "$metadata" in error)
  );
}

export function isNotFoundError(error: unknown): boolean {
  if (!isS3Error(error)) {return false;}
  return (
    error.name === "NotFound" ||
    error.name === "NoSuchKey" ||
    error.$metadata?.httpStatusCode === NOT_FOUND_STATUS
  );
}

export function buildS3Url(
  bucketName: string,
  region: string,
  key: string,
): string {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

export async function checkFileExists(
  s3Client: S3ClientLike,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
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
      })}`,
    );
  }
}
