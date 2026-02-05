import { APP_COOKIE_PREFIX } from '@deepcrawl/auth/configs/constants';
import { getSessionCookie } from 'better-auth/cookies';
import { DeepcrawlApp } from 'deepcrawl';
import { DeepcrawlError } from 'deepcrawl/types';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { buildDeepcrawlHeaders, isBetterAuthMode } from '@/lib/auth-mode';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

export async function GET(request: NextRequest) {
  if (isBetterAuthMode()) {
    const sessionToken = getSessionCookie(request, {
      cookiePrefix: APP_COOKIE_PREFIX,
    });

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
    }
  }

  const requestHeaders = await headers();

  try {
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: buildDeepcrawlHeaders(requestHeaders),
    });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const format = searchParams.get('format');

    if (!(id && format)) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and format' },
        { status: 400 },
      );
    }

    if (!['json', 'markdown', 'links'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be: json, markdown, or links' },
        { status: 400 },
      );
    }

    const exportedData = await dc.exportResponse({
      id,
      format: format as 'json' | 'markdown' | 'links',
    });

    return NextResponse.json(exportedData, { status: 200 });
  } catch (error) {
    if (error instanceof DeepcrawlError) {
      return NextResponse.json(
        { error: error.userMessage ?? error.message, code: error.code },
        { status: error.status ?? 500 },
      );
    }

    console.error('Failed to export log response:', error);
    return NextResponse.json(
      { error: 'Failed to export log response' },
      { status: 500 },
    );
  }
}
