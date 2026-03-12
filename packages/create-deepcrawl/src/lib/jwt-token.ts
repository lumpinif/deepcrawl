import { createHmac } from 'node:crypto';

export type MintHs256JwtInput = {
  secret: string;
  subject: string;
  expiresInMinutes?: number;
  issuer?: string;
  audience?: string;
};

function toBase64Url(value: string | Buffer): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function mintHs256Jwt(input: MintHs256JwtInput): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresInMinutes = input.expiresInMinutes ?? 15;
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const payload = {
    sub: input.subject,
    iat: nowSeconds,
    exp: nowSeconds + expiresInMinutes * 60,
    ...(input.issuer ? { iss: input.issuer } : {}),
    ...(input.audience ? { aud: input.audience } : {}),
  };

  const headerSegment = toBase64Url(JSON.stringify(header));
  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signature = createHmac('sha256', input.secret)
    .update(signingInput)
    .digest();

  return `${signingInput}.${toBase64Url(signature)}`;
}
