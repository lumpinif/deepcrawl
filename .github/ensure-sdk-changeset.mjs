#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const baseRef = process.argv[2] ?? 'origin/main';

function getChangedFiles(ref) {
  try {
    const output = execSync(`git diff --name-only ${ref}...HEAD`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error(
      `🛑 Failed to compute git diff against ${ref}:`,
      error?.stderr?.toString() ?? error,
    );
    process.exit(1);
  }
}

function collectChangesetPackages() {
  const directory = '.changeset';
  let files;

  try {
    files = readdirSync(directory);
  } catch (error) {
    console.error(
      '🛑 Unable to read .changeset directory. Did you forget to commit changesets?',
    );
    process.exit(1);
  }

  const packages = new Set();
  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }
    const filepath = join(directory, file);
    const content = readFileSync(filepath, 'utf8');
    const match = content.match(/^---\n([\s\S]+?)\n---/);
    if (!match) {
      continue;
    }
    const lines = match[1].split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }
      const pkgMatch = line.match(
        /^["']?([^"']+)["']?\s*:\s*(major|minor|patch|none)/i,
      );
      if (pkgMatch) {
        packages.add(pkgMatch[1]);
      }
    }
  }
  return packages;
}

const changedFiles = getChangedFiles(baseRef);
const touchedTypes = changedFiles.some((file) =>
  file.startsWith('packages/types/'),
);
const touchedContracts = changedFiles.some((file) =>
  file.startsWith('packages/contracts/'),
);

if (!(touchedTypes || touchedContracts)) {
  process.exit(0);
}

const declaredPackages = collectChangesetPackages();
const requiredPackages = new Set(['deepcrawl']);
if (touchedTypes) {
  requiredPackages.add('@deepcrawl/types');
}
if (touchedContracts) {
  requiredPackages.add('@deepcrawl/contracts');
}

const missing = [];
for (const pkg of requiredPackages) {
  if (!declaredPackages.has(pkg)) {
    missing.push(pkg);
  }
}

if (missing.length > 0) {
  console.error(
    [
      '🛑 Changes detected in core SDK dependencies:',
      touchedTypes ? '  - packages/types' : null,
      touchedContracts ? '  - packages/contracts' : null,
      '',
      '💡 Please add a changeset that includes the following packages:',
      ...missing.map((pkg) => `  - ${pkg}`),
      '',
      '💡 Example:',
      'pnpm changeset',
      '...select deepcrawl along with any updated internal packages.',
    ]
      .filter(Boolean)
      .join('\n'),
  );
  process.exit(1);
}

process.exit(0);
