import type { MerlinRequest, MerlinResponse } from './types';

const MERLIN_API_URL = import.meta.env.VITE_MERLIN_URL || '/api/synthesize';

export async function synthesize(request: MerlinRequest): Promise<MerlinResponse> {
  const response = await fetch(MERLIN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Merlin synthesis failed: ${response.status}`);
  }

  return response.json();
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
