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
    if (error.name === 'NotFound' || error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw new Error(`S3 error: ${error.name || 'Unknown'} - ${error.message || 'No message'}`);
  }
}
