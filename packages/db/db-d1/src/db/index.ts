import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

export const createDBD1 = (d1: D1Database) => {
  return drizzle(d1);
};

export * from './schema';
