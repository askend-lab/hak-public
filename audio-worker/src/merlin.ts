interface MerlinResponse {
  audio: string;
  format: string;
}

export async function synthesize(
  text: string,
  merlinUrl: string,
  voice: string = 'efm_s'
): Promise<Buffer> {
  const response = await fetch(merlinUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice,
      returnBase64: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Merlin API error: ${response.status}`);
  }

  const data = await response.json() as MerlinResponse;
  return Buffer.from(data.audio, 'base64');
}
