const filterWorkerConfigs = (files) =>
  files.filter((file) => !file.endsWith('worker-configuration.d.ts'));

const quote = (file) => `"${file.replace(/(["\\$`])/g, '\\$1')}"`;

const runBiome = (files) => {
  const filtered = filterWorkerConfigs(files);
  if (filtered.length === 0) {
    return [];
  }

  const joined = filtered.map(quote).join(' ');
  return `biome check --write --files-ignore-unknown=true ${joined}`;
};

/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*.{ts,tsx,js,jsx,cjs,mjs,cts,mts}': runBiome,
  'apps/app/**/*.{ts,tsx,js,jsx}': [
    'biome check --write --files-ignore-unknown=true',
    'pnpm -C apps/app lint:fix',
  ],
  '*.{json,jsonc}': 'biome check --write --files-ignore-unknown=true',
  '*.{css,scss,pcss}': 'biome check --write --files-ignore-unknown=true',
};
