import { getAuth } from '@deepcrawl/auth/lib/auth';
import { NextResponse } from 'next/server';

function normalizeApiKey(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractApiKeyFromAuthorizationHeader(
  authorization: string | null,
): string | null {
  if (!authorization) {
    return null;
  }

  // NOTE: Do not use a naive `replace('Bearer ', '')` here. We only accept an
  // actual Bearer scheme to avoid accidentally accepting other auth schemes.
  // Per RFC 7235, auth scheme comparison is case-insensitive.
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const bodyApiKey = normalizeApiKey(body?.apiKey);
  const headerApiKey = normalizeApiKey(request.headers.get('x-api-key'));
  const bearerApiKey = extractApiKeyFromAuthorizationHeader(
    request.headers.get('authorization'),
  );

  // Prefer the canonical Authorization header when present.
  const apiKey = bearerApiKey ?? headerApiKey ?? bodyApiKey;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing API key' },
      {
        status: 400,
      },
    );
  }

  const auth = getAuth();
  const headers = new Headers(request.headers);
  headers.set('x-api-key', apiKey);

  const session = await auth.api.getSession({ headers });
  return NextResponse.json(session);
}
