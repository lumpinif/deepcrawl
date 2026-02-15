import { randomBytes } from 'node:crypto';

export function generateJwtSecret(): string {
  // 32 bytes hex => 64 chars, good enough for HS256.
  return randomBytes(32).toString('hex');
}
