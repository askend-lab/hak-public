/* eslint-disable @typescript-eslint/no-unsafe-call -- AWS SDK S3 operations */
import { HeadObjectCommand, type S3Client } from '@aws-sdk/client-s3';

interface S3Error {
  name?: string;
  message?: string;
  code?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}

export async function checkFileExists(
  s3Client: Pick<S3Client, 'send'>,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- AWS SDK command construction
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    });
    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    const s3Error = error as S3Error;
    const statusCode = s3Error.$metadata?.httpStatusCode;
    const errorName = s3Error.name;
    const errorMessage = s3Error.message;
    const errorCode = s3Error.code;
    
    const NOT_FOUND_STATUS = 404;
    if (errorName === 'NotFound' || errorName === 'NoSuchKey' || statusCode === NOT_FOUND_STATUS) {
      return false;
    }
    const errorDetails = JSON.stringify({
      name: errorName,
      message: errorMessage,
      code: errorCode,
      statusCode,
      bucket,
      key
    });
    throw new Error(`S3 error: ${errorDetails}`);
  }
}
