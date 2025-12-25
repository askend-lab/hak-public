import { S3Client } from '@aws-sdk/client-s3';
import { SQSClient } from '@aws-sdk/client-sqs';
import { createLogger } from '@hak/shared';

import { runWorker, WorkerConfig } from './worker';

const logger = createLogger('info');

const config: WorkerConfig = {
  queueUrl: process.env.QUEUE_URL ?? '',
  bucketName: process.env.BUCKET_NAME ?? '',
  merlinUrl: process.env.MERLIN_URL ?? '',
};

if (!config.queueUrl || !config.bucketName || !config.merlinUrl) {
  logger.error('Missing required environment variables:');
  logger.error(`  QUEUE_URL: ${config.queueUrl ? 'set' : 'MISSING'}`);
  logger.error(`  BUCKET_NAME: ${config.bucketName ? 'set' : 'MISSING'}`);
  logger.error(`  MERLIN_URL: ${config.merlinUrl ? 'set' : 'MISSING'}`);
  process.exit(1);
}

const sqsClient = new SQSClient({});
const s3Client = new S3Client({});

const abortController = new AbortController();

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down...');
  abortController.abort();
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down...');
  abortController.abort();
});

runWorker(sqsClient, s3Client, config, abortController.signal)
  .then(() => {
    logger.info('Worker finished');
    process.exit(0);
  })
  .catch((error: unknown) => {
    logger.error('Worker failed:', error);
    process.exit(1);
  });
