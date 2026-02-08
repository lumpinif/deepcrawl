import { APP_COOKIE_PREFIX } from '@deepcrawl/auth/configs/constants';
import { getSessionCookie } from 'better-auth/cookies';
import { DeepcrawlApp } from 'deepcrawl';
import { DeepcrawlError } from 'deepcrawl/types';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildDeepcrawlHeaders, isBetterAuthMode } from '@/lib/auth-mode';
import { parseListLogsSearchParams } from '@/utils/logs';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

function extractApiKeyFromRequest(request: NextRequest): string | null {
  const xApiKey = request.headers.get('x-api-key')?.trim();
  if (xApiKey) {
    return xApiKey;
  }

  const auth = request.headers.get('authorization');
  if (!auth) {
    return null;
  }

  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : null;
}

export async function GET(request: NextRequest) {
  const apiKey = extractApiKeyFromRequest(request);

  if (isBetterAuthMode()) {
    const sessionToken = getSessionCookie(request, {
      cookiePrefix: APP_COOKIE_PREFIX,
    });

    // In self-hosted cross-domain deployments, the Better Auth session cookie
    // cannot be shared with the dashboard domain. Allow API key auth as a
    // fallback (passed via Authorization / x-api-key header).
    if (!(sessionToken || apiKey)) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
    }
  }

  const requestHeaders = await headers();

  try {
    const dc = apiKey
      ? new DeepcrawlApp({
          baseUrl: DEEPCRAWL_BASE_URL,
          apiKey,
        })
      : new DeepcrawlApp({
          baseUrl: DEEPCRAWL_BASE_URL,
          headers: buildDeepcrawlHeaders(requestHeaders),
        });

    const searchParams = request.nextUrl.searchParams;
    const parsed = parseListLogsSearchParams(searchParams);

    if (!parsed.success) {
      const error = z.treeifyError(parsed.error);
      return NextResponse.json(
        { error: '[NEXT_API_LOGS] Invalid query parameters', details: error },
        { status: 400 },
      );
    }

    const logs = await dc.listLogs(parsed.options);

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
