import { getAuth } from '@deepcrawl/auth/lib/auth';
import { NextResponse } from 'next/server';

function extractApiKeyFromAuthorizationHeader(
  authorization: string | null,
): string | null {
  if (!authorization) {
    return null;
  }

  // Per RFC 7235, auth scheme comparison is case-insensitive.
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const bodyApiKey =
    typeof body?.apiKey === 'string' ? body.apiKey.trim() : null;
  const headerApiKey = request.headers.get('x-api-key')?.trim() || null;
  const bearerApiKey = extractApiKeyFromAuthorizationHeader(
    request.headers.get('authorization'),
  );

  const apiKey = bodyApiKey || headerApiKey || bearerApiKey;

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
