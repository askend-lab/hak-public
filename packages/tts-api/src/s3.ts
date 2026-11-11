// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import { buildS3Url, checkFileExists } from "@hak/shared";
import { getAwsRegion, getS3Bucket } from "./env";

export { isNotFoundError } from "@hak/shared";

let _s3Client: S3Client | undefined;
function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({ region: getAwsRegion() });
  }
  return _s3Client;
}

export function buildCacheKey(cacheKey: string): string {
  return `cache/${cacheKey}.wav`;
}

export function buildAudioUrl(cacheKey: string): string {
  return buildS3Url(getS3Bucket(), getAwsRegion(), buildCacheKey(cacheKey));
}

export async function checkS3Cache(cacheKey: string): Promise<boolean> {
  return checkFileExists(getS3Client(), getS3Bucket(), buildCacheKey(cacheKey));
}
