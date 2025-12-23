import { createHash } from 'node:crypto';

export function calculateHash(text: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- crypto hash is safe
  return createHash('sha256').update(text).digest('hex');
}
