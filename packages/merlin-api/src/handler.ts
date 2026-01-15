/* eslint-disable max-lines-per-function */
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { ECSClient, UpdateServiceCommand, DescribeServicesCommand } from '@aws-sdk/client-ecs';
import { createHash } from 'crypto';

const sqsClient = new SQSClient({ region: process.env.AWS_REGION_NAME });
const s3Client = new S3Client({ region: process.env.AWS_REGION_NAME });
const ecsClient = new ECSClient({ region: process.env.AWS_REGION_NAME });

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL ?? '';
const S3_BUCKET = process.env.S3_BUCKET ?? '';

interface SynthesizeRequest {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

function generateCacheKey(text: string, voice: string, speed: number, pitch: number): string {
  const input = `${text}|${voice}|${speed}|${pitch}`;
  return createHash('md5').update(input).digest('hex');
}

async function checkS3Cache(cacheKey: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: `cache/${cacheKey}.wav`
    }));
    return true;
  } catch {
    return false;
  }
}

async function sendToQueue(message: object): Promise<string> {
  const result = await sqsClient.send(new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message)
  }));
  return result.MessageId ?? '';
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export async function synthesize(event: { body?: string }): Promise<LambdaResponse> {
  try {
    const body: SynthesizeRequest = JSON.parse(event.body ?? '{}');
    
    if (!body.text) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing text field' })
      };
    }

    const voice = body.voice ?? 'efm_l';
    const speed = body.speed ?? 1.0;
    const pitch = body.pitch ?? 0;
    const cacheKey = generateCacheKey(body.text, voice, speed, pitch);

    // Check if already cached
    const cached = await checkS3Cache(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
          cacheKey,
          audioUrl: `https://${S3_BUCKET}.s3.eu-west-1.amazonaws.com/cache/${cacheKey}.wav`
        })
      };
    }

    // Send to SQS for processing
    await sendToQueue({
      text: body.text,
      voice,
      speed,
      pitch,
      cacheKey
    });

    return {
      statusCode: 202,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'processing',
        cacheKey,
        audioUrl: `https://${S3_BUCKET}.s3.eu-west-1.amazonaws.com/cache/${cacheKey}.wav`
      })
    };
  } catch (error) {
    console.error('Synthesize error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

export async function status(event: { pathParameters?: { cacheKey?: string } }): Promise<LambdaResponse> {
  try {
    const cacheKey = event.pathParameters?.cacheKey;
    
    if (!cacheKey) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing cacheKey' })
      };
    }

    const ready = await checkS3Cache(cacheKey);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: ready ? 'ready' : 'processing',
        cacheKey,
        audioUrl: ready ? `https://${S3_BUCKET}.s3.eu-west-1.amazonaws.com/cache/${cacheKey}.wav` : null
      })
    };
  } catch (error) {
    console.error('Status error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

export async function health(): Promise<LambdaResponse> {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ok', version: '1.0.0' })
  };
}

export async function warmup(): Promise<LambdaResponse> {
  const cluster = process.env.ECS_CLUSTER ?? '';
  const service = process.env.ECS_SERVICE ?? '';

  if (!cluster || !service) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing ECS config' })
    };
  }

  try {
    // Check current state
    const describe = await ecsClient.send(new DescribeServicesCommand({
      cluster,
      services: [service]
    }));

    const currentDesired = describe.services?.[0]?.desiredCount ?? 0;
    const running = describe.services?.[0]?.runningCount ?? 0;

    if (currentDesired >= 1) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'already_warm', running, desired: currentDesired })
      };
    }

    // Scale up to 1
    await ecsClient.send(new UpdateServiceCommand({
      cluster,
      service,
      desiredCount: 1
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'warming', running: 0, desired: 1 })
    };
  } catch (error) {
    console.error('Warmup error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to warmup' })
    };
  }
}
