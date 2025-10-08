'use server';

import type {
  GetManyLogsOptions,
  GetManyLogsResponse,
} from '@deepcrawl/contracts';
import { resolveGetManyLogsOptions } from '@deepcrawl/contracts';
import {
  // GetManyLogsOptionsSchema,
  normalizeGetManyLogsPagination,
} from '@deepcrawl/types/routers/logs';
import { DeepcrawlApp } from 'deepcrawl';
import { headers } from 'next/headers';

// import { z } from 'zod/v4';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

/**
 * Deepcrawl Server API Call:
 */
export async function dcGetManyLogs(
  params?: GetManyLogsOptions,
): Promise<GetManyLogsResponse> {
  try {
    const resolvedParams = resolveGetManyLogsOptions(params);
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

    const normalized = normalizeGetManyLogsPagination(resolvedParams);
    return await dc.getManyLogs({ ...resolvedParams, ...normalized });
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
