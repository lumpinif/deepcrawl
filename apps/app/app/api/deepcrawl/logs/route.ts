import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { authGetSession } from '@/query/auth-query.server';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

export async function GET() {
  const session = await authGetSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
  }

  const requestHeaders = await headers();

  try {
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: requestHeaders,
    });

    const logs = await dc.getManyLogs();

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    if (error instanceof DeepcrawlError) {
      return NextResponse.json(
        { error: error.userMessage ?? error.message, code: error.code },
        { status: error.status ?? 500 },
      );
    }

    console.error('Failed to fetch Deepcrawl logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Deepcrawl logs' },
      { status: 500 },
    );
  }
}
