import { randomBytes } from 'node:crypto';

export const MIN_JWT_SECRET_BYTES = 32;

export function validateJwtSecretStrength(secret: string): string | undefined {
  const normalized = secret.trim();

  if (!normalized) {
    return;
  }

  return Buffer.byteLength(normalized, 'utf8') >= MIN_JWT_SECRET_BYTES
    ? undefined
    : `Use at least ${MIN_JWT_SECRET_BYTES} bytes, or leave this blank to generate one.`;
}

export function generateJwtSecret(): string {
  // 32 bytes hex => 64 chars, good enough for HS256.
  return randomBytes(MIN_JWT_SECRET_BYTES).toString('hex');
}
