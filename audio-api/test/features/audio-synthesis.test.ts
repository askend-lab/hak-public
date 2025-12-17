import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { createHash } from 'crypto';

const STAGE = process.env.STAGE || 'dev';
const BUCKET_NAME = `hak-audio-${STAGE}`;
const API_ENDPOINT = process.env.API_ENDPOINT || `https://3ktlnibu21.execute-api.eu-west-1.amazonaws.com/${STAGE}/generate`;
const TEST_TEXT = `tere-${Date.now()}`;

const s3Client = new S3Client({ region: 'eu-west-1' });

describe('Audio Synthesis E2E Test', () => {
  it('should generate and cache an audio file', async () => {
    // 1. Calculate hash and define S3 key
    const hash = createHash('sha256').update(TEST_TEXT).digest('hex');
    const key = `cache/${hash}.mp3`;


    // 3. Trigger the synthesis process
    const { status, data } = await axios.post(API_ENDPOINT, { text: TEST_TEXT });
    expect(status).toBe(200);
    expect(data.status).toBe('processing');
    expect(data.hash).toBe(hash);

    // 4. Poll S3 until the file is created
    let fileExists = false;
    for (let i = 0; i < 30; i++) {
      try {
        await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        fileExists = true;
        console.log(`File found: ${key}`);
        break;
      } catch (error: any) {
        if (error.name === 'NotFound') {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } else {
          throw error;
        }
      }
    }

    // 5. Assert that the file was created
    expect(fileExists).toBe(true);
  }, 60000); // 60-second timeout for the test
});
