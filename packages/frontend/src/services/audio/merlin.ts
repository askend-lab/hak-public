import type { MerlinRequest, MerlinResponse } from './types';
import { httpPost, httpPostBlob } from '../http';
import { API_CONFIG } from '../config';

export type SynthesizeFormat = 'json' | 'blob';

export async function synthesize(
  request: MerlinRequest,
  format: SynthesizeFormat = 'json'
): Promise<MerlinResponse> {
  return httpPost<MerlinResponse>(API_CONFIG.merlinUrl, { ...request, format });
}

export async function synthesizeToBlob(request: MerlinRequest): Promise<Blob> {
  return httpPostBlob(API_CONFIG.merlinUrl, { ...request, format: 'blob' });
}
