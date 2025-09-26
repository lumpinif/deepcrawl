import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  noExternal: ['@deepcrawl/contracts', '@deepcrawl/types'],
  treeshake: true,
  splitting: false,
  minify: true,
  target: 'es2020',
  dts: {
    resolve: true,
  },
});
