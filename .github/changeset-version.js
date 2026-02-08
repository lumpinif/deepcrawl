// ORIGINALLY FROM CLOUDFLARE WRANGLER:
// https://github.com/cloudflare/wrangler2/blob/main/.github/changeset-version.js

import { execSync } from 'node:child_process';

// This script is used by the `release.yml` workflow to update the version of the packages being released.
//
// IMPORTANT:
// - This repo uses pnpm (and pnpm Catalogs: `catalog:`), so running `npm install`
//   will fail and is not needed.
// - After versioning, we update `pnpm-lock.yaml` so the release PR includes the
//   lockfile changes.
execSync('pnpm changeset version', { stdio: 'inherit' });
execSync('pnpm -w install --lockfile-only', { stdio: 'inherit' });
