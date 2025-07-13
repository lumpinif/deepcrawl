import type { AppContext } from '@/lib/context';

export function isProduction(c: AppContext): boolean {
  return c.env.WORKER_NODE_ENV === 'production';
}
