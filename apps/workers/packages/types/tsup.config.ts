import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'routers/read': 'src/routers/read/index.ts',
      'routers/links': 'src/routers/links/index.ts',
      'routers/browse': 'src/routers/browse/index.ts',
      'services/cheerio': 'src/services/cheerio/index.ts',
      'services/html-cleaning': 'src/services/html-cleaning/index.ts',
      'services/link': 'src/services/link/index.ts',
      'services/metadata': 'src/services/metadata/index.ts',
    },
    outDir: 'dist',
    banner: {},
    format: ['cjs', 'esm'],
    external: [],
    dts: true,
    sourcemap: true,
  },
]);
