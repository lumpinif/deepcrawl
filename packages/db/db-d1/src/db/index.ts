import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

export const createD1DB = (d1: D1Database) => {
  return drizzle(d1);
};

export * from './schema';
