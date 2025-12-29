import { API_CONFIG } from '../config';
import { httpPost } from '../http';

interface AudioApiResponse {
  status: 'ready' | 'processing';
  url?: string;
  hash: string;
}

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 60;
const HTTP_PARTIAL_CONTENT = 206;

export async function synthesizeViaApi(text: string): Promise<string> {
  const response = await httpPost<AudioApiResponse>(API_CONFIG.audioApiUrl, { text });
  
  if (response.status === 'ready' && response.url !== undefined && response.url !== '') {
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
      // Use GET with range header to check if file exists (HEAD blocked by CORS)
       
      const response = await fetch(audioUrl, { 
        method: 'GET',
        headers: { 'Range': 'bytes=0-0' }
      });
      // 200/206 = file ready, 403/404 = not ready yet
      if (response.ok || response.status === HTTP_PARTIAL_CONTENT) {
        return audioUrl;
      }
      // 403/404 means file not ready yet - continue polling
    } catch (error) {
      // Network error - log and continue polling
      console.debug('Polling attempt failed:', error);
    }
     
    await new Promise((resolve) => {
      setTimeout(resolve, POLL_INTERVAL_MS);
    });
  }
  
  throw new Error('Audio generation timed out');
}
