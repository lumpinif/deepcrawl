'use server';

import type { ListLogsOptions, ListLogsResponse } from '@deepcrawl/contracts';
import { resolveListLogsOptions } from '@deepcrawl/contracts';
import { DeepcrawlApp } from 'deepcrawl';
import { normalizeListLogsPagination } from 'deepcrawl/types';
import { headers } from 'next/headers';
import { buildDeepcrawlHeaders } from '@/lib/auth-mode';

// import { z } from 'zod/v4';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

/**
 * Deepcrawl Server API Call:
 */
export async function dcListLogs(
  params?: ListLogsOptions,
): Promise<ListLogsResponse> {
  try {
    const resolvedParams = resolveListLogsOptions(params);
    const requestHeaders = await headers();
    const dc = new DeepcrawlApp({
      baseUrl: DEEPCRAWL_BASE_URL,
      headers: buildDeepcrawlHeaders(requestHeaders),
    });

    // DISABLED VALIDATION FOR NOW
    // const validation = ListLogsOptionsSchema.safeParse(params);

    // if (!validation.success) {
    //   console.error(
    //     '[SERVER_LOGS] Invalid Deepcrawl log parameters',
    //     z.treeifyError(validation.error),
    //   );
    //   throw new Error('[SERVER_LOGS] Invalid Deepcrawl log parameters');
    // }

    const normalized = normalizeListLogsPagination(resolvedParams);
    return await dc.listLogs({ ...resolvedParams, ...normalized });
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
