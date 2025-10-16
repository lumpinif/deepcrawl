import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { remarkMdxFiles, remarkNpm } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { createGenerator, remarkAutoTypeTable } from 'fumadocs-typescript';

export const docs = defineDocs({
  dir: 'content/docs',
});

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = moduleDir.includes(`${path.sep}.source`)
  ? path.resolve(moduleDir, '..')
  : moduleDir;

const tsGenerator = createGenerator({
  basePath: appDir,
  tsconfigPath: path.resolve(appDir, 'tsconfig.json'),
  cache: false, // disable cache for production build
});

// proactively ensure the .next/fumadocs-typescript directory exists before generation runs fixes the error: ENOENT: no such file or directory, mkdir '.next/fumadocs-typescript' in production build
fs.mkdirSync(path.join(appDir, '.next/fumadocs-typescript'), {
  recursive: true,
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkNpm,
      remarkMdxFiles,
      [
        remarkAutoTypeTable,
        {
          name: 'AutoTypeTable',
          generator: tsGenerator,
          options: {
            basePath: appDir,
          },
        },
      ],
    ],
  },
});
