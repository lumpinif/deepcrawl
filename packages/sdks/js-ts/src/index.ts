// Export contract types for advanced users

// Re-export all from internal packages
export type * from '@deepcrawl/contracts';
export type { contract as DeepcrawlContract } from '@deepcrawl/contracts';

export * from '@deepcrawl/types';

export type { ContractRouterClient } from '@orpc/contract';

export { DeepcrawlApp } from './deepcrawl';

export {
  // Infrastructure errors (oRPC/HTTP errors)
  DeepcrawlAuthError,
  type DeepcrawlClient,
  // Configuration types
  type DeepcrawlConfig,
  // Base error class
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  // Custom business errors (API-specific errors)
  DeepcrawlReadError,
  DeepcrawlServerError,
  DeepcrawlValidationError,
} from './types';
