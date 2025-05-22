import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const getApikeyLoadKeysPostSchema = z.object({
  secret_id: z.string(),
});
export const getApikeyLoadKeysPostValidator = () =>
  zValidator('form', getApikeyLoadKeysPostSchema);

export const createApikeyPostSchema = z.object({
  key_description: z.string(),
});
export const createApikeyPostValidator = () =>
  zValidator('form', createApikeyPostSchema);

export const revokeApikeyPostSchema = z.object({
  secret_id: z.string(),
});
export const revokeApikeyPostValidator = () =>
  zValidator('form', revokeApikeyPostSchema);

export const testApiKeyPostSchema = z.object({
  Authorization: z.string(),
});
export const testApiKeyPostValidator = () =>
  zValidator('header', testApiKeyPostSchema);
