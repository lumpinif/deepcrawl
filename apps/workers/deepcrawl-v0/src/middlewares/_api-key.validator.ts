import { z } from '@hono/zod-openapi';
import { zValidator } from '@hono/zod-validator';

export const getApikeyLoadKeysPostSchema = z.object({
  secret_id: z.string(),
});
export function getApikeyLoadKeysPostValidator() {
  return zValidator('form', getApikeyLoadKeysPostSchema);
}

export const createApikeyPostSchema = z.object({
  key_description: z.string(),
});
export function createApikeyPostValidator() {
  return zValidator('form', createApikeyPostSchema);
}

export const revokeApikeyPostSchema = z.object({
  secret_id: z.string(),
});
export function revokeApikeyPostValidator() {
  return zValidator('form', revokeApikeyPostSchema);
}

export const testApiKeyPostSchema = z.object({
  Authorization: z.string(),
});
export function testApiKeyPostValidator() {
  return zValidator('header', testApiKeyPostSchema);
}
