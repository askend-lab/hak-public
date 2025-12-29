import { API_CONFIG } from '../config';
import { httpPost, httpPostBlob } from '../http';

import type { MerlinRequest, MerlinResponse } from './types';

interface EkiMerlinResponse {
  audio: string;
  format: string;
}

export type SynthesizeFormat = 'json' | 'blob';

export async function synthesize(
  request: MerlinRequest
): Promise<MerlinResponse> {
  const ekiResponse = await httpPost<EkiMerlinResponse>(API_CONFIG.merlinUrl, {
    text: request.text,
    voice: request.voice,
    returnBase64: true,
  });
  
  const audioUrl = `data:audio/wav;base64,${ekiResponse.audio}`;
  
  return {
    audioUrl,
    duration: 0,
  };
}

export async function synthesizeToBlob(request: MerlinRequest): Promise<Blob> {
  return httpPostBlob(API_CONFIG.merlinUrl, { ...request, format: 'blob' });
}
