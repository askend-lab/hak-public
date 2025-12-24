import { createHash } from 'node:crypto';

export function calculateHash(text: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }
  return createHash('sha256').update(text).digest('hex');
}
