import { calculateHash } from './hash';
import { checkFileExists } from './s3';
import { publishToQueue } from './sqs';

const MAX_TEXT_LENGTH = 1000;

export async function handler(
  event: any,
  s3Client: any,
  sqsClient: any
): Promise<any> {
  try {
    const bucketName = process.env.BUCKET_NAME!;
    const queueUrl = process.env.QUEUE_URL!;
    
    const body = JSON.parse(event.body);
    const text = body.text;
    
    if (!text || typeof text !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Text field is required'
        })
      };
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Text is too long (max ${MAX_TEXT_LENGTH} characters)`
        })
      };
    }
    
    const hash = calculateHash(text);
    const key = `cache/${hash}.mp3`;
    
    const exists = await checkFileExists(s3Client, bucketName, key);
    
    if (exists) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'ready',
          url: `https://${bucketName}.s3.amazonaws.com/${key}`,
          hash
        })
      };
    }
    
    await publishToQueue(sqsClient, queueUrl, text, hash);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'processing',
        hash
      })
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
}
