import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

type EnvUpdates = Record<string, string>;

function getDefaultHeader(filePath: string): string[] {
  if (filePath.endsWith('.dev.vars.production')) {
    return [
      '# Added by create-deepcrawl',
      '# Used by Wrangler for production secrets. Keep this file private.',
      '',
    ];
  }

  return [
    '# Added by create-deepcrawl',
    '# Used by Wrangler for local secrets. Keep this file private.',
    '',
  ];
}

export function upsertEnvFile(filePath: string, updates: EnvUpdates): void {
  mkdirSync(dirname(filePath), { recursive: true });

  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
  const lines =
    existing.length > 0
      ? existing.split(/\r?\n/)
      : [...getDefaultHeader(filePath)];

  const seen = new Set<string>();
  const updatedLines = lines.map((line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=/);
    const key = match?.[1];

    if (!key) {
      return line;
    }

    if (updates[key] === undefined) {
      return line;
    }

    if (seen.has(key)) {
      // Intentionally leave an empty placeholder here; the final newline
      // normalization collapses duplicate entries without reordering comments.
      return '';
    }

    seen.add(key);
    return `${key}=${updates[key]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (seen.has(key)) {
      continue;
    }

    if (!updatedLines.some((line) => line.trim() === '# JWT')) {
      if (updatedLines.length > 0 && updatedLines.at(-1)?.trim()) {
        updatedLines.push('');
      }
      updatedLines.push('# JWT');
    }

    updatedLines.push(`${key}=${value}`);
  }

  const output = updatedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();

  writeFileSync(filePath, `${output}\n`);
}
