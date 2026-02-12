// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

export interface MerlinResponse {
  audio: string;
  format: string;
}

export const DEFAULT_VOICE = "efm_s";

export async function synthesize(
  text: string,
  merlinUrl: string,
  voice = DEFAULT_VOICE,
): Promise<Buffer> {
  const response = await fetch(merlinUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice,
      returnBase64: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Merlin API error: ${String(response.status)}`);
  }

  const data = (await response.json()) as MerlinResponse;
  return Buffer.from(data.audio, "base64");
}
