import { httpPost } from '../http';
import { API_CONFIG } from '../config';

interface AudioApiResponse {
  status: 'ready' | 'processing';
  url?: string;
  hash: string;
}

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 60;

export async function synthesizeViaApi(text: string): Promise<string> {
  const response = await httpPost<AudioApiResponse>(API_CONFIG.audioApiUrl, { text });
  
  if (response.status === 'ready' && response.url) {
    return response.url;
  }
  
  // Poll for completion
  const audioUrl = await pollForAudio(response.hash);
  return audioUrl;
}

async function pollForAudio(hash: string): Promise<string> {
  const bucketUrl = API_CONFIG.audioBucketUrl;
  const audioUrl = `${bucketUrl}/cache/${hash}.mp3`;
  
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      if (response.ok) {
        return audioUrl;
      }
    } catch {
      // File not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  
  throw new Error('Audio generation timed out');
}
