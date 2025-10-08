import { APP_COOKIE_PREFIX } from '@deepcrawl/auth/configs/constants';
import { getSessionCookie } from 'better-auth/cookies';
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseGetManyLogsSearchParams } from '@/utils/logs';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

export async function GET(request: NextRequest) {
  const sessionToken = getSessionCookie(request, {
    cookiePrefix: APP_COOKIE_PREFIX,
  });

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
  }

  const requestHeaders = await headers();

  try {
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: requestHeaders,
    });

    const searchParams = request.nextUrl.searchParams;
    const parsed = parseGetManyLogsSearchParams(searchParams);

    if (!parsed.success) {
      const error = z.treeifyError(parsed.error);
      return NextResponse.json(
        { error: '[NEXT_API_LOGS] Invalid query parameters', details: error },
        { status: 400 },
      );
    }

    const logs = await dc.getManyLogs(parsed.options);

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
