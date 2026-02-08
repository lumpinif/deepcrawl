import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

export const createDBD1 = (d1: D1Database) => {
  return drizzle(d1);
};

// Re-export common drizzle-orm functions for convenience
export {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  isNull,
  lte,
  or,
  sql,
} from 'drizzle-orm';

export * from './schema';
