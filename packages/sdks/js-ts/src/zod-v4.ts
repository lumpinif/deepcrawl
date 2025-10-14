/**
 * Deepcrawl Zod helper.
 *
 * Re-exporting `z` from `zod/v4` ensures consumers can import
 * `deepcrawl/zod/v4` and share the same Zod runtime as the SDK.
 *
 * Use this helper when composing Zod schemas with the SDK's public schemas
 * or utils to avoid instance-mismatch issues in environments that hoist
 * multiple copies of Zod.
 */
export { z } from 'zod/v4';
