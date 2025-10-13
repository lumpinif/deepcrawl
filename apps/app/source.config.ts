import { remarkNpm } from 'fumadocs-core/mdx-plugins';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { createGenerator, remarkAutoTypeTable } from 'fumadocs-typescript';

export const docs = defineDocs({
  dir: 'content/docs',
});

const tsGenerator = createGenerator();

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [
      remarkNpm,
      [remarkAutoTypeTable, { generator: tsGenerator }],
    ],
  },
});
