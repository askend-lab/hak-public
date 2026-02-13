// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client } from "@aws-sdk/client-s3";
import {
  buildS3Url,
  checkFileExists,
  type S3ClientLike,
} from "@hak/shared";
import { getAwsRegion, getS3Bucket } from "./env";

const s3Client: S3ClientLike = new S3Client({ region: getAwsRegion() });

export function buildCacheKey(cacheKey: string): string {
  return `cache/${cacheKey}.wav`;
}

export function buildAudioUrl(cacheKey: string): string {
  return buildS3Url(getS3Bucket(), getAwsRegion(), buildCacheKey(cacheKey));
}

export async function checkS3Cache(cacheKey: string): Promise<boolean> {
  return checkFileExists(s3Client, getS3Bucket(), buildCacheKey(cacheKey));
}
