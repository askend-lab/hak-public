import { HeadObjectCommand } from '@aws-sdk/client-s3';

export async function checkFileExists(
  s3Client: any,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}
