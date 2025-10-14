import type z from 'zod/v4';
import type { BaseSuccessResponseSchema } from './response-schemas';

/**
 * Type alias for {@link BaseSuccessResponseSchema}.
 * Represents the shared fields included in successful responses.
 */
export type BaseSuccessResponse = z.infer<typeof BaseSuccessResponseSchema>;
