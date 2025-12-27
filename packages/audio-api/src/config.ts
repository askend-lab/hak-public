export interface Config {
  bucketName: string;
  queueUrl: string;
}

export function getConfig(): Config {
  const env = process.env.ENV;
  if (!env) {
    throw new Error('ENV environment variable is required');
  }

  const region = process.env.AWS_REGION ?? 'eu-west-1';
  const accountId = process.env.AWS_ACCOUNT_ID ?? '';

  return {
    bucketName: `hak-audio-${env}`,
    queueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/hak-audio-generation-${env}`,
  };
}
