import { APP_COOKIE_PREFIX } from '@deepcrawl/auth/configs/constants';
import { resolveGetManyLogsOptions } from '@deepcrawl/contracts';
import {
  GetManyLogsOptionsSchema,
  normalizeGetManyLogsPagination,
} from '@deepcrawl/types/routers/logs';
import { getSessionCookie } from 'better-auth/cookies';
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    const rawOptions = {
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined,
      offset: searchParams.get('offset')
        ? Number(searchParams.get('offset'))
        : undefined,
      path: searchParams.get('path') ?? undefined,
      success:
        searchParams.get('success') !== null
          ? searchParams.get('success') === 'true'
          : undefined,
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
    };

    const validation = GetManyLogsOptionsSchema.safeParse(rawOptions);

    if (!validation.success) {
      const error = z.treeifyError(validation.error);
      return NextResponse.json(
        { error: '[NEXT_API_LOGS] Invalid query parameters', details: error },
        { status: 400 },
      );
    }

    const resolvedOptions = resolveGetManyLogsOptions(validation.data);
    const normalized = normalizeGetManyLogsPagination(resolvedOptions);
    const logs = await dc.getManyLogs({
      ...resolvedOptions,
      ...normalized,
    });

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
