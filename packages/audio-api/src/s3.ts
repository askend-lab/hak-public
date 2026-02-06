import { HeadObjectCommand } from '@aws-sdk/client-s3';

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

function isS3Error(error: unknown): error is S3Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('name' in error || '$metadata' in error)
  );
}

export async function checkFileExists(
  s3Client: S3ClientLike,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    });
    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    if (!isS3Error(error)) {
      throw new Error(`Unknown S3 error: ${String(error)}`);
    }
    const s3Error = error;
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
