import type { MerlinRequest, MerlinResponse } from './types';
import { httpPost } from '../http';

const MERLIN_API_URL = import.meta.env.VITE_MERLIN_URL || '/api/synthesize';

export type SynthesizeFormat = 'json' | 'blob';

export async function synthesize(
  request: MerlinRequest,
  format: SynthesizeFormat = 'json'
): Promise<MerlinResponse> {
  return httpPost<MerlinResponse>(MERLIN_API_URL, { ...request, format });
}

export async function synthesizeToBlob(request: MerlinRequest): Promise<Blob> {
  const response = await fetch(MERLIN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, format: 'blob' }),
  });

  if (!response.ok) {
    throw new Error(`Merlin synthesis failed: ${response.status}`);
  }

  return response.blob();
}
