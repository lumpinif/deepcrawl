import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as DBschema from './schema';

export const schema = DBschema;

export function getDrizzleDB({ DATABASE_URL }: { DATABASE_URL?: string }) {
  if (DATABASE_URL) {
    const sql = neon(DATABASE_URL);
    return drizzle(sql);
  }

  throw new Error('No DATABASE_URL provided');
}
