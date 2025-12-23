/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- AWS SDK S3 operations */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function uploadAudio(
  client: S3Client,
  bucketName: string,
  hash: string,
  audioBuffer: Buffer
): Promise<void> {
  const key = `cache/${hash}.mp3`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: audioBuffer,
    ContentType: 'audio/mpeg',
  });

  await client.send(command);
}
