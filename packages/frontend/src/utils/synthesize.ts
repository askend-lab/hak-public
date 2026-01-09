const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 30;

interface SynthesizeResponse {
  status: 'processing' | 'ready' | 'cached';
  cacheKey: string;
  audioUrl: string | null;
}

interface StatusResponse {
  status: 'processing' | 'ready' | 'error';
  cacheKey: string;
  audioUrl: string | null;
  error?: string;
}

async function pollForAudio(cacheKey: string): Promise<string> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const response = await fetch(`/api/status/${cacheKey}`);
    if (!response.ok) throw new Error('Status check failed');
    const data: StatusResponse = await response.json();
    
    if (data.status === 'ready' && data.audioUrl) {
      return data.audioUrl;
    }
    if (data.status === 'error') {
      throw new Error(data.error ?? 'Synthesis failed');
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error('Synthesis timed out');
}

export async function synthesizeWithPolling(text: string, voice: string): Promise<string> {
  const response = await fetch('/api/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });
  if (!response.ok) throw new Error('Synthesis request failed');
  
  const data: SynthesizeResponse = await response.json();
  
  if ((data.status === 'cached' || data.status === 'ready') && data.audioUrl) {
    return data.audioUrl;
  }
  
  return pollForAudio(data.cacheKey);
}
