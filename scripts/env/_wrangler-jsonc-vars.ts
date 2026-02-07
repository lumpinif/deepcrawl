import type { JsoncValue } from './_jsonc';
import {
  ensureJsoncObjectAtPath,
  findJsoncObjectRangeForPath,
  type JsoncObjectRange,
  upsertJsoncObjectProperties,
} from './_jsonc';

export type WranglerVarsSyncParams = {
  source: string;
  rootEntries: readonly { key: string; value: JsoncValue }[];
  productionEntries: readonly { key: string; value: JsoncValue }[];
};

export type WranglerVarsSyncResult = {
  content: string;
  didChange: boolean;
};

function ensureCommentBlockBeforeKey(params: {
  source: string;
  range: JsoncObjectRange;
  key: string;
  commentLines: readonly string[];
}): { content: string; didChange: boolean } {
  const { source, range, key, commentLines } = params;
  const objectText = source.slice(range.start, range.end + 1);

  // Fast path: already present anywhere in this object.
  if (objectText.includes(commentLines[0] ?? '')) {
    return { content: source, didChange: false };
  }

  const lines = objectText.split('\n');
  const escapedKey = key.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  const keyRegex = new RegExp(`^\\s*"${escapedKey}"\\s*:`);

  const keyLineIdx = lines.findIndex((line) => keyRegex.test(line));
  if (keyLineIdx === -1) {
    return { content: source, didChange: false };
  }

  const keyLine = lines[keyLineIdx] ?? '';
  const indentMatch = keyLine.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? '';

  const formatted = commentLines.map((line) => `${indent}// ${line}`);
  lines.splice(keyLineIdx, 0, ...formatted);

  const updatedObjectText = lines.join('\n');
  const updatedSource =
    source.slice(0, range.start) +
    updatedObjectText +
    source.slice(range.end + 1);

  return { content: updatedSource, didChange: true };
}

export function syncWranglerJsoncVars(
  params: WranglerVarsSyncParams,
): WranglerVarsSyncResult | null {
  let content = params.source;

  const ensuredRootVars = ensureJsoncObjectAtPath(content, ['vars']);
  if (!ensuredRootVars) {
    return null;
  }
  content = ensuredRootVars.content;

  const ensuredProdVars = ensureJsoncObjectAtPath(content, [
    'env',
    'production',
    'vars',
  ]);
  if (!ensuredProdVars) {
    return null;
  }
  content = ensuredProdVars.content;

  const rootVarsRange = findJsoncObjectRangeForPath(content, ['vars']);
  const prodVarsRange = findJsoncObjectRangeForPath(content, [
    'env',
    'production',
    'vars',
  ]);

  if (!(rootVarsRange && prodVarsRange)) {
    return null;
  }

  let next = content;
  let didChange = next !== params.source;

  const edits = [
    { range: rootVarsRange, entries: params.rootEntries },
    { range: prodVarsRange, entries: params.productionEntries },
  ].sort((a, b) => b.range.start - a.range.start);

  for (const edit of edits) {
    if (edit.entries.length === 0) {
      continue;
    }
    const result = upsertJsoncObjectProperties(next, edit.range, edit.entries);
    next = result.content;
    didChange ||= result.didChange;
  }

  // Insert small, user-facing hints in wrangler.jsonc for JWT vars (only when
  // those keys exist). This restores comments that are otherwise lost when the
  // "vars" object is re-created.
  const rootVarsRangeAfter = findJsoncObjectRangeForPath(next, ['vars']);
  const prodVarsRangeAfter = findJsoncObjectRangeForPath(next, [
    'env',
    'production',
    'vars',
  ]);

  const commentEdits: Array<{
    range: JsoncObjectRange;
    commentLines: readonly string[];
  }> = [];

  if (prodVarsRangeAfter) {
    commentEdits.push({
      range: prodVarsRangeAfter,
      commentLines: [
        'JWT_* are only needed when AUTH_MODE=jwt, JWT_ISSUER and JWT_AUDIENCE are optional.',
        "Don't put JWT_SECRET here. Use Wrangler secrets for JWT_SECRET in production. Or add it to .dev.vars.production for production secrets.",
      ],
    });
  }

  if (rootVarsRangeAfter) {
    commentEdits.push({
      range: rootVarsRangeAfter,
      commentLines: [
        'JWT_* are only needed when AUTH_MODE=jwt, JWT_ISSUER and JWT_AUDIENCE are optional.',
        "Don't put JWT_SECRET here. Use Wrangler secrets for JWT_SECRET in production. Or add it to .dev.vars for local development.",
      ],
    });
  }

  commentEdits.sort((a, b) => b.range.start - a.range.start);

  for (const edit of commentEdits) {
    const result = ensureCommentBlockBeforeKey({
      source: next,
      range: edit.range,
      key: 'JWT_ISSUER',
      commentLines: edit.commentLines,
    });
    next = result.content;
    didChange ||= result.didChange;
  }

  return { content: next, didChange };
}
