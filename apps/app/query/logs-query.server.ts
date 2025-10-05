'use server';

import { DeepcrawlApp, type GetManyLogsResponse } from 'deepcrawl';
import { headers } from 'next/headers';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

/**
 * Deepcrawl Server API Call:
 */
export async function fetchDeepcrawlLogs(): Promise<GetManyLogsResponse> {
  try {
    const requestHeaders = await headers();
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: requestHeaders,
    });

    const result: GetManyLogsResponse = await dc.getManyLogs();

    return result;
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
