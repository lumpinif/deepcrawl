import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export function getDrizzleDB({
  env,
  DATABASE_URL,
}: { env?: CloudflareBindings; DATABASE_URL?: string }) {
  if (env) {
    const sql = neon(env.DATABASE_URL);
    return drizzle(sql);
  }

  if (DATABASE_URL) {
    const sql = neon(DATABASE_URL);
    return drizzle(sql);
  }

  throw new Error('No DATABASE_URL provided');
}
