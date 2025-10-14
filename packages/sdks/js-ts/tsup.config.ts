import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/types-public.ts',
    './src/schemas-public.ts',
    './src/types-utils.ts',
    './src/zod-v4.ts',
  ],
  format: ['cjs', 'esm'],
  clean: true,
  noExternal: ['@deepcrawl/contracts', '@deepcrawl/types'],
  external: [/^zod/],
  treeshake: true,
  splitting: false,
  minify: true,
  target: 'es2020',
  dts: {
    resolve: true,
  },
});
