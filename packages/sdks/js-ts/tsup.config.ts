import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  noExternal: ['@deepcrawl/contracts', '@deepcrawl/types'],
  treeshake: true,
  splitting: false,
  minify: false, // Keep readable for debugging
  target: 'es2020',
  dts: {
    resolve: true,
  },
});
