'use client';

import React from 'react';

const createContextHook = <T>(
  context: React.Context<T | undefined>,
  hookName: string,
  providerName: string,
) => {
  return () => {
    const ctx = React.useContext(context);
    if (!ctx) {
      throw new Error(`${hookName} must be used within a ${providerName}`);
    }
    return ctx;
  };
};

const createContext = <T>(defaultValue: T) => {
  const Context = React.createContext<T | undefined>(defaultValue);
  const useContext = createContextHook(Context, 'useContext', 'Context');

  return [Context.Provider, useContext] as const;
};

export { createContextHook, createContext };
