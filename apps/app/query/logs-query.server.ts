'use server';

import {
  // GetManyLogsOptionsSchema,
  normalizeActivityLogsPagination,
} from '@deepcrawl/types/routers/logs';
import { DeepcrawlApp, type GetManyLogsResponse } from 'deepcrawl';
import { headers } from 'next/headers';
// import { z } from 'zod/v4';
import {
  type ActivityLogsQueryParams,
  DEFAULT_ACTIVITY_LOGS_QUERY_PARAMS,
} from './logs-query.shared';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

/**
 * Deepcrawl Server API Call:
 */
export async function fetchDeepcrawlLogs(
  params: ActivityLogsQueryParams = DEFAULT_ACTIVITY_LOGS_QUERY_PARAMS,
): Promise<GetManyLogsResponse> {
  try {
    const requestHeaders = await headers();
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: requestHeaders,
    });

    // DISABLED VALIDATION FOR NOW
    // const validation = GetManyLogsOptionsSchema.safeParse(params);

    // if (!validation.success) {
    //   console.error(
    //     '[SERVER_LOGS] Invalid Deepcrawl log parameters',
    //     z.treeifyError(validation.error),
    //   );
    //   throw new Error('[SERVER_LOGS] Invalid Deepcrawl log parameters');
    // }

    const normalized = normalizeActivityLogsPagination(params);
    return await dc.getManyLogs({ ...params, ...normalized });
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
