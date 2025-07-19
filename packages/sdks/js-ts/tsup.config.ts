import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  // Bundle internal workspace dependencies to avoid external dependency issues
  noExternal: ['@deepcrawl/contracts', '@deepcrawl/types'],
  // Keep external dependencies as peer dependencies
  external: ['@orpc/client', '@orpc/contract', 'zod'],
  treeshake: true,
  splitting: false,
  minify: false, // Keep readable for debugging
  target: 'es2020',
  // Generate TypeScript declaration files
  dts: true,
});
