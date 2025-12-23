interface MerlinResponse {
  audio: string;
  format: string;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions -- fetch API and Buffer */
export async function synthesize(
  text: string,
  merlinUrl: string,
  voice = 'efm_s'
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
    throw new Error(`Merlin API error: ${String(response.status)}`);
  }

  const data = await response.json() as MerlinResponse;
  return Buffer.from(data.audio, 'base64');
}
