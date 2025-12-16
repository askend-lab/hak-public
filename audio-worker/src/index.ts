import { SQSClient } from '@aws-sdk/client-sqs';
import { S3Client } from '@aws-sdk/client-s3';
import { runWorker, WorkerConfig } from './worker';

const config: WorkerConfig = {
  queueUrl: process.env.QUEUE_URL!,
  bucketName: process.env.BUCKET_NAME!,
  merlinUrl: process.env.MERLIN_URL!,
};

if (!config.queueUrl || !config.bucketName || !config.merlinUrl) {
  console.error('Missing required environment variables:');
  console.error('  QUEUE_URL:', config.queueUrl ? 'set' : 'MISSING');
  console.error('  BUCKET_NAME:', config.bucketName ? 'set' : 'MISSING');
  console.error('  MERLIN_URL:', config.merlinUrl ? 'set' : 'MISSING');
  process.exit(1);
}

const sqsClient = new SQSClient({});
const s3Client = new S3Client({});

const abortController = new AbortController();

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  abortController.abort();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  abortController.abort();
});

runWorker(sqsClient, s3Client, config, abortController.signal)
  .then(() => {
    console.log('Worker finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Worker failed:', error);
    process.exit(1);
  });
