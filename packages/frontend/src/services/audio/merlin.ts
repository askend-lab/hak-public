import type { MerlinRequest, MerlinResponse } from './types';
import { httpPost } from '../http';
import { API_CONFIG } from '../config';

export type SynthesizeFormat = 'json' | 'blob';

export async function synthesize(
  request: MerlinRequest,
  format: SynthesizeFormat = 'json'
): Promise<MerlinResponse> {
  return httpPost<MerlinResponse>(API_CONFIG.merlinUrl, { ...request, format });
}

export async function synthesizeToBlob(request: MerlinRequest): Promise<Blob> {
  const response = await fetch(API_CONFIG.merlinUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, format: 'blob' }),
  });

  if (!response.ok) {
    throw new Error(`Merlin synthesis failed: ${response.status}`);
  }

  return response.blob();
}
