export interface Config {
  bucketName: string;
  queueUrl: string;
}

export function getConfig(): Config {
  const env = process.env.ENV ?? '';
  
  if (env === '') {
    throw new Error('ENV environment variable is required');
  }
  
  const awsRegion = process.env.AWS_REGION ?? 'us-east-1';
  const awsAccountId = process.env.AWS_ACCOUNT_ID ?? '123456789012';
  
  return {
    bucketName: `hak-audio-${env}`,
    queueUrl: `https://sqs.${awsRegion}.amazonaws.com/${awsAccountId}/hak-audio-generation-${env}`
  };
}
