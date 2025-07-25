import { env as envWorker } from 'cloudflare:workers';
import type { AppBindings } from '@/lib/context';

export const logDebug = (
  envProp?: AppBindings['Bindings'],
  ...args: unknown[]
) => {
  const env = envProp?.WORKER_NODE_ENV || envWorker.WORKER_NODE_ENV;
  // if (env === 'development') {
  console.log(...args);
  // }
};

export const logWarn = (
  envProp?: AppBindings['Bindings'],
  ...args: unknown[]
) => {
  const env = envProp?.WORKER_NODE_ENV || envWorker.WORKER_NODE_ENV;
  // if (env === 'development') {
  console.warn(...args);
  // }
};

export const logError = (
  envProp?: AppBindings['Bindings'],
  ...args: unknown[]
) => {
  const env = envProp?.WORKER_NODE_ENV || envWorker.WORKER_NODE_ENV;
  // if (env === 'development') {
  console.error(...args);
  // }
};
