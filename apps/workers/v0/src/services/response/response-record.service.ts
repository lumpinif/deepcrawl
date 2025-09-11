import { eq, type NewResponseRecord, responseRecord } from '@deepcrawl/db-d1';
import type { LinksSuccessResponse } from '@deepcrawl/types/routers/links/types';

import type { AppVariables, ORPCContext } from '@/lib/context';
import {
  isLinksResponseWithoutTree,
  isLinksResponseWithTree,
} from '@/routers/links/links.processor';
import { sha256Hash, stableStringify } from '@/utils/hash/hash-tools';
import {
  calculateResponseSize,
  generateResponseHash,
} from '@/utils/hash/response-hash';
import { logDebug, logError } from '@/utils/loggers';
import type { ExtractedDynamicsForHashResult } from '@/utils/tail-jobs/dynamics-handling';
import type { AnyRequestsOptions } from '@/utils/tail-jobs/post-processing';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

interface CreateRequestOptionsHashParams {
  requestOptions: AnyRequestsOptions;
}

interface CreateStableResponseHashParams {
  path: string;
  requestUrl: string;
  optionsHash: string;
  response: ExtractedDynamicsForHashResult['responseForHash'];
  linksRootKey?: string;
}

interface StoreResponseRecordParams {
  path: string;
  requestUrl: string;
  responseContent: ExtractedDynamicsForHashResult['responseForHash'];
  optionsHash: string;
  responseHash: string;
}

/**
 * Response Record Service
 * Handles deduplication and storage of response record for both read and links endpoints
 */
export class ResponseRecordService {
  constructor(
    private db: AppVariables['dbd1'],
    private userId: string,
  ) {}

  async createRequestOptionsHash({
    requestOptions,
  }: CreateRequestOptionsHashParams): Promise<string> {
    // metricsOptions are not needed for hashing
    if ('metricsOptions' in requestOptions) {
      const { metricsOptions: _mO, ...rest } = requestOptions;
      return await sha256Hash(stableStringify(rest));
    }

    return await sha256Hash(stableStringify(requestOptions));
  }

  /**
   * Stable response hash policy selector across endpoints.
   * - read-getMarkdown: hash(targetUrl + optionsHash + markdown)
   * - read-readUrl: hash(targetUrl + optionsHash + responseWithoutMetrics)
   * - links-*: hash(linksRootKey + optionsHash + 'links-v1')
   */
  async createStableResponseHash(
    params: CreateStableResponseHashParams,
  ): Promise<string> {
    const { path, optionsHash, requestUrl, response, linksRootKey } = params;
    if (path.startsWith('links-') && linksRootKey) {
      // links without tree (isTree=false) → response already canonicalized upstream
      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        (response as LinksSuccessResponse).success === true &&
        isLinksResponseWithoutTree(response as LinksSuccessResponse)
      ) {
        const canonical = JSON.stringify(response);
        return await sha256Hash(
          `${linksRootKey}|${optionsHash}|links|no-tree|${canonical}`,
        );
      }

      // links with tree: use stripped response content for consistent hashing
      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        (response as LinksSuccessResponse).success === true &&
        isLinksResponseWithTree(response as LinksSuccessResponse)
      ) {
        const canonical = JSON.stringify(response);
        return await sha256Hash(
          `${linksRootKey}|${optionsHash}|links|with-tree|${canonical}`,
        );
      }
      // fallback for non-success responses: stable key only
      return await sha256Hash(`${linksRootKey}|${optionsHash}|links`);
    }

    const targetUrl =
      typeof response === 'object'
        ? response.targetUrl
        : targetUrlHelper(requestUrl, true);
    return await generateResponseHash(targetUrl, optionsHash, response);
  }

  /**
   * store response record with deduplication
   */
  async storeResponseRecord(params: StoreResponseRecordParams): Promise<void> {
    const { path, responseContent, requestUrl, optionsHash, responseHash } =
      params;

    try {
      // Check if response already exists
      const existing = await this.db
        .select()
        .from(responseRecord)
        .where(eq(responseRecord.responseHash, responseHash))
        .limit(1);

      const now = new Date().toISOString();
      const responseSize = calculateResponseSize(responseContent);

      if (existing.length > 0) {
        // Response exists - only update timestamp to preserve historical accuracy
        // Never overwrite responseContent as it corrupts data authenticity
        await this.db
          .update(responseRecord)
          .set({ updatedAt: now, updatedBy: this.userId })
          .where(eq(responseRecord.responseHash, responseHash));

        logDebug(
          '[ResponseRecordService] 💽 Existing response record found - timestamp updated',
          {
            responseHash,
            preservedContent: true,
          },
        );
      } else {
        // New response - insert with deduplication
        const newResponse: NewResponseRecord = {
          path,
          responseContent,
          responseHash,
          optionsHash,
          responseSize,
          updatedBy: this.userId,
        };

        await this.db.insert(responseRecord).values(newResponse);

        logDebug(
          '[ResponseRecordService] ✅ Response record stored successfully',
          {
            responseHash,
            requestUrl,
            responseSize,
          },
        );
      }
    } catch (error) {
      logError('[ResponseRecordService] ❌ Response record storage failed', {
        responseHash,
        requestUrl,
        optionsHash,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

/**
 * Factory function to create ResponseRecordService instance
 */
export function createResponseRecordService(
  c: ORPCContext,
): ResponseRecordService {
  const db = c.var.dbd1;
  const userId = c.var.session?.user.id as string; // we know it must be a string because of the authed procedure
  return new ResponseRecordService(db, userId);
}
