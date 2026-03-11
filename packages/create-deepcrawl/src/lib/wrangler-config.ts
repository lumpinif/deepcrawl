import { readFile, writeFile } from 'node:fs/promises';
import { applyEdits, type FormattingOptions, modify } from 'jsonc-parser';

const FORMATTING: FormattingOptions = {
  insertSpaces: true,
  tabSize: 2,
  eol: '\n',
};

function applyChange(
  source: string,
  path: (string | number)[],
  value: unknown,
): string {
  const edits = modify(source, path, value as never, {
    formattingOptions: FORMATTING,
  });
  return applyEdits(source, edits);
}

export async function updateWranglerJsonc({
  filePath,
  update,
}: {
  filePath: string;
  update: (source: string) => string;
}) {
  const source = await readFile(filePath, 'utf8');
  const next = update(source);
  if (next !== source) {
    await writeFile(filePath, next, 'utf8');
  }
}

export function setJsoncPath(
  source: string,
  path: (string | number)[],
  value: unknown,
): string {
  return applyChange(source, path, value);
}
