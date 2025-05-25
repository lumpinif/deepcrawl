import type { AppContext } from '@/lib/types';

export function isProduction(c: AppContext): boolean {
  return c.env.WORKER_NODE_ENV === 'production';
}

export function isStaging(c: AppContext): boolean {
  return c.env.WORKER_NODE_ENV === 'staging';
}
