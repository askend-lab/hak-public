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
    const statusCode = error.$metadata?.httpStatusCode;
    if (error.name === 'NotFound' || error.name === 'NoSuchKey' || statusCode === 404) {
      return false;
    }
    const errorDetails = JSON.stringify({
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode,
      bucket,
      key
    });
    throw new Error(`S3 error: ${errorDetails}`);
  }
}
