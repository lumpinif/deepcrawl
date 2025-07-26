// Export contract types for advanced users
export type { contract as DeepcrawlContract } from '@deepcrawl/contracts';
export type { ContractRouterClient } from '@orpc/contract';
export { DeepcrawlApp } from './deepcrawl';
export {
  // Infrastructure errors (oRPC/HTTP errors)
  DeepcrawlAuthError,
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

// Type helper for creating custom clients
import type { ContractRouterClient as CRC } from '@orpc/contract';
export type DeepcrawlClient = CRC<
  typeof import('@deepcrawl/contracts').contract
>;

// Re-export all types from internal packages
export type * from '@deepcrawl/contracts';
export type * from '@deepcrawl/types';
