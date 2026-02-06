import { readFileSync, writeFileSync } from 'node:fs';

export type DotenvMap = Record<string, string>;

export function parseDotenv(content: string): DotenvMap {
  const out: DotenvMap = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const line = trimmed.startsWith('export ')
      ? trimmed.slice('export '.length).trim()
      : trimmed;

    const idx = line.indexOf('=');
    if (idx <= 0) {
      continue;
    }

    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    if (!key) {
      continue;
    }

    // Keep empty values.
    let value = rawValue;

    // Strip surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

export function readDotenvFile(filePath: string): DotenvMap {
  const content = readFileSync(filePath, 'utf-8');
  return parseDotenv(content);
}

export function formatDotenvValue(value: string): string {
  if (!value) {
    return '';
  }

  // Keep common placeholders unquoted (e.g. ****).
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
    return value;
  }

  // Minimal escaping for newlines and quotes.
  const escaped = value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return `"${escaped}"`;
}

export function writeFileIfChanged(filePath: string, content: string): boolean {
  let existing = '';
  try {
    existing = readFileSync(filePath, 'utf-8');
  } catch {
    existing = '';
  }

  if (existing === content) {
    return false;
  }

  writeFileSync(filePath, content, 'utf-8');
  return true;
}
