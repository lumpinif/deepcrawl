#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function prepareTemplateOutput(targetDir = process.cwd()) {
  const projectDir = resolve(targetDir);
  const internalCliDir = resolve(projectDir, 'packages', 'create-deepcrawl');

  if (!existsSync(internalCliDir)) {
    return;
  }

  await rm(internalCliDir, {
    force: true,
    recursive: true,
  });
}

const [, , targetDir] = process.argv;

prepareTemplateOutput(targetDir).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`prepare-template-output failed: ${message}\n`);
  process.exit(1);
});
