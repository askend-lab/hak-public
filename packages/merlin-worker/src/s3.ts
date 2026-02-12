// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AUDIO_CONTENT_TYPE = "audio/mpeg";

export function buildCacheKey(hash: string): string {
  return `cache/${hash}.mp3`;
}

export async function uploadAudio(
  client: S3Client,
  bucketName: string,
  hash: string,
  audioBuffer: Buffer,
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: buildCacheKey(hash),
    Body: audioBuffer,
    ContentType: AUDIO_CONTENT_TYPE,
  });

  await client.send(command);
}
