/* eslint-disable no-console */

export const logDebug = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.log(...args);
};

export const logWarn = (...args: unknown[]) => {
  console.warn(...args);
};

export const logError = (...args: unknown[]) => {
  console.error(...args);
};
