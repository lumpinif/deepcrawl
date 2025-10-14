/**
 * Schema-centric exports for Deepcrawl.
 *
 * Aggregates every Zod schema surface so downstream packages can expose a
 * focused `schemas` entrypoint without duplicating path logic. Some modules
 * also export companion TypeScript types alongside their schemas.
 *
 * TODO: SOCIAL: SHARE HOW WE PROTECTED THIS FROM CIRCULAR DEPENDENCIES BY USING BIOME.
 * ⚠️ **CRITICAL WARNING FOR INTERNAL USAGE:** (already protected by biome)
 * DO NOT import from '@deepcrawl/types/schemas' within the @deepcrawl/types package!
 * This creates circular dependencies that break runtime execution (tsx, node, etc.)
 * even though TypeScript compilation and IDE intelliSense work fine.
 *
 * ✅ **CORRECT** (within @deepcrawl/types package):
 * ```typescript
 * // Use relative imports to avoid circular dependencies
 * import { MetricsSchema } from '../../metrics/schemas';
 * import { CacheOptionsSchema } from '../../services/cache/schemas';
 * ```
 *
 * ❌ **WRONG** (within @deepcrawl/types package):
 * ```typescript
 * // This creates circular dependencies!
 * import { MetricsSchema, CacheOptionsSchema } from '@deepcrawl/types/schemas';
 * ```
 *
 * ✅ **EXTERNAL USAGE IS FINE:**
 * This barrel export is intended ONLY for external consumers:
 * - @deepcrawl/contracts
 * - @deepcrawl/workers
 * - deepcrawl SDK
 * - Any other packages outside @deepcrawl/types
 *
 * External packages SHOULD use the barrel export for convenience.
 */

/* Common */
export * from './common/response-schemas';

/* Metrics */
export * from './metrics/schemas';

/* Routers */
export * from './routers/links/schemas';
export * from './routers/logs/schemas';
export * from './routers/read/schemas';

/* Services */
export * from './services/cache/schemas';
export * from './services/html-cleaning/schemas';
export * from './services/link/schemas';
export * from './services/markdown/schemas';
export * from './services/metadata/schemas';
export * from './services/scrape/schemas';
