import { env as envWorker } from 'cloudflare:workers';

export const logDebug = (...args: unknown[]) => {
  const env = envWorker.AUTH_WORKER_NODE_ENV;
  if (env === 'development') {
    console.log(...args);
  }
};

export const logWarn = (...args: unknown[]) => {
  const env = envWorker.AUTH_WORKER_NODE_ENV;
  if (env === 'development') {
    console.warn(...args);
  }
};

export const logError = (...args: unknown[]) => {
  const env = envWorker.AUTH_WORKER_NODE_ENV;
  // if (env === 'development') {
  console.error(...args);
  // }
};
