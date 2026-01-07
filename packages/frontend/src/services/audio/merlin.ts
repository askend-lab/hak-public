import { API_CONFIG } from '../config';
import { httpGet, httpPost } from '../http';

import type { MerlinRequest, MerlinResponse } from './types';

interface MerlinSynthesizeResponse {
  status: 'processing' | 'ready' | 'cached';
  cacheKey: string;
  audioUrl: string | null;
}

interface MerlinStatusResponse {
  status: 'processing' | 'ready' | 'error';
  cacheKey: string;
  audioUrl: string | null;
  error?: string;
}

export type SynthesizeFormat = 'json' | 'blob';

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 30;

async function pollForAudio(cacheKey: string): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const response = await httpGet<MerlinStatusResponse>(
      `${API_CONFIG.merlinUrl}/status/${cacheKey}`
    );
    
    if (response.status === 'ready' && response.audioUrl) {
      return response.audioUrl;
    }
    
    if (response.status === 'error') {
      throw new Error(response.error ?? 'Synthesis failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  
  throw new Error('Synthesis timed out');
}

export async function synthesize(
  request: MerlinRequest
): Promise<MerlinResponse> {
  const response = await httpPost<MerlinSynthesizeResponse>(
    `${API_CONFIG.merlinUrl}/synthesize`,
    {
      text: request.text,
      voice: request.voice,
    }
  );
  
  // If already cached, return immediately
  if (response.status === 'cached' && response.audioUrl) {
    return { audioUrl: response.audioUrl, duration: 0 };
  }
  
  // Poll until ready
  const audioUrl = await pollForAudio(response.cacheKey);
  
  return { audioUrl, duration: 0 };
}

export async function synthesizeToBlob(request: MerlinRequest): Promise<Blob> {
  const { audioUrl } = await synthesize(request);
  const response = await fetch(audioUrl);
  return response.blob();
}
