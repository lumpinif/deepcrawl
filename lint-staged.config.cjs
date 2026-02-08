const path = require('node:path');

const filterWorkerConfigs = (files) =>
  files.filter((file) => !file.endsWith('worker-configuration.d.ts'));

const quote = (file) => `"${file.replace(/(["\\$`])/g, '\\$1')}"`;

const toAbsolutePath = (file) =>
  path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);

const runBiome = (files) => {
  const filtered = filterWorkerConfigs(files);
  if (filtered.length === 0) {
    return [];
  }

  const joined = filtered.map(quote).join(' ');
  return `biome check --write --files-ignore-unknown=true --no-errors-on-unmatched ${joined}`;
};

const runEslintFix = (workdir, files) => {
  if (files.length === 0) {
    return [];
  }

  // Use absolute paths so the command works even when we change cwd via pnpm -C.
  const joined = files.map(toAbsolutePath).map(quote).join(' ');
  return `pnpm -C ${workdir} exec eslint --fix --max-warnings 0 ${joined}`;
};

/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}': runBiome,
  'apps/app/**/*.{ts,tsx,js,jsx}': (files) => runEslintFix('apps/app', files),
  'packages/ui/**/*.{ts,tsx,js,jsx}': (files) =>
    runEslintFix('packages/ui', files),
  '*.code-workspace':
    'biome check --write --files-ignore-unknown=true --no-errors-on-unmatched',
  '*.{json,jsonc}':
    'biome check --write --files-ignore-unknown=true --no-errors-on-unmatched',
  '*.{css,scss,pcss}':
    'biome check --write --files-ignore-unknown=true --no-errors-on-unmatched',
};
