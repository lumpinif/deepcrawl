import { getAuth } from '@deepcrawl/auth/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const apiKey =
    body?.apiKey ??
    request.headers.get('x-api-key') ??
    request.headers.get('authorization')?.replace('Bearer ', '');

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
