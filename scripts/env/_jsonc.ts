export type JsoncObjectRange = {
  start: number;
  end: number;
};

export type JsoncScalar = string | number | boolean;

export type JsoncValue =
  | JsoncScalar
  | {
      kind: 'raw';
      value: string;
    };

function skipJsoncTrivia(source: string, start: number): number {
  let i = start;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    // UTF-8 BOM
    if (ch === '\ufeff') {
      i += 1;
      continue;
    }

    // Whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i += 1;
      continue;
    }

    // Line comment
    if (ch === '/' && next === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    // Block comment
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < source.length) {
        if (source[i] === '*' && source[i + 1] === '/') {
          i += 2;
          break;
        }
        i += 1;
      }
      continue;
    }

    break;
  }

  return i;
}

function readJsoncString(
  source: string,
  start: number,
): { value: string; end: number } | null {
  const quote = source[start];
  if (quote !== '"') {
    return null;
  }

  let i = start + 1;
  let value = '';
  let escaped = false;

  while (i < source.length) {
    const ch = source[i];

    if (escaped) {
      // For our use-case (object keys), we only need the raw content.
      value += ch;
      escaped = false;
      i += 1;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      i += 1;
      continue;
    }

    if (ch === '"') {
      return { value, end: i + 1 };
    }

    value += ch;
    i += 1;
  }

  return null;
}

function findMatchingBrace(source: string, start: number): number | null {
  if (source[start] !== '{') {
    return null;
  }

  let depth = 1;
  let i = start + 1;

  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
      }
      i += 1;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        i += 1;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inString = false;
        i += 1;
        continue;
      }

      i += 1;
      continue;
    }

    if (ch === '"' /* start string */) {
      inString = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
      i += 1;
      continue;
    }

    i += 1;
  }

  return null;
}

function findFirstObjectRange(source: string): JsoncObjectRange | null {
  const start = skipJsoncTrivia(source, 0);
  if (source[start] !== '{') {
    return null;
  }

  const end = findMatchingBrace(source, start);
  if (end == null) {
    return null;
  }

  return { start, end };
}

function findChildObjectRange(
  source: string,
  parent: JsoncObjectRange,
  key: string,
): JsoncObjectRange | null {
  let i = parent.start + 1;
  let depth = 1;

  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < parent.end) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false;
      }
      i += 1;
      continue;
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i += 1;
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        i += 1;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        i += 1;
        continue;
      }

      if (ch === '"') {
        inString = false;
        i += 1;
        continue;
      }

      i += 1;
      continue;
    }

    if (ch === '"' && depth === 1) {
      const str = readJsoncString(source, i);
      if (!str) {
        i += 1;
        continue;
      }

      const afterKey = skipJsoncTrivia(source, str.end);
      if (source[afterKey] !== ':') {
        i = str.end;
        continue;
      }

      const afterColon = skipJsoncTrivia(source, afterKey + 1);
      if (str.value !== key) {
        i = afterColon;
        continue;
      }

      if (source[afterColon] !== '{') {
        return null;
      }

      const end = findMatchingBrace(source, afterColon);
      if (end == null) {
        return null;
      }

      return { start: afterColon, end };
    }

    if (ch === '"') {
      inString = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === '{') {
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      i += 1;
      continue;
    }

    i += 1;
  }

  return null;
}

export function findJsoncObjectRangeForPath(
  source: string,
  path: readonly string[],
): JsoncObjectRange | null {
  const root = findFirstObjectRange(source);
  if (!root) {
    return null;
  }

  let current = root;
  for (const segment of path) {
    const child = findChildObjectRange(source, current, segment);
    if (!child) {
      return null;
    }
    current = child;
  }

  return current;
}

export function listJsoncObjectKeys(
  source: string,
  range: JsoncObjectRange,
): Set<string> {
  const inner = source.slice(range.start + 1, range.end);
  const keys = new Set<string>();

  for (const line of inner.split('\n')) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(/^\s*"([^"]+)"\s*:/);
    const key = m?.[1];
    if (key !== undefined) {
      keys.add(key);
    }
  }

  return keys;
}

function formatJsoncValue(value: JsoncValue): string {
  if (typeof value === 'object') {
    return value.value;
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  return String(value);
}

function getLineIndent(source: string, index: number): string {
  const lineStart = source.lastIndexOf('\n', index);
  const start = lineStart === -1 ? 0 : lineStart + 1;

  let i = start;
  while (i < source.length && source[i] === ' ') {
    i += 1;
  }

  return source.slice(start, i);
}

function findLineCommentStart(line: string): number | null {
  let inString = false;
  let escaped = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        continue;
      }

      if (ch === '"') {
        inString = false;
      }

      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === '/' && next === '/') {
      return i;
    }
  }

  return null;
}

function splitLineComment(line: string): { code: string; comment: string } {
  const idx = findLineCommentStart(line);
  if (idx == null) {
    return { code: line, comment: '' };
  }

  return { code: line.slice(0, idx), comment: line.slice(idx) };
}

function ensureTrailingComma(line: string): string {
  const { code, comment } = splitLineComment(line);
  const codeTrimEnd = code.replace(/\s+$/, '');
  if (codeTrimEnd.endsWith(',')) {
    return line;
  }

  const trailing = code.slice(codeTrimEnd.length);
  return `${codeTrimEnd},${trailing}${comment}`;
}

function readScalarTokenFromPropertyLine(
  line: string,
  key: string,
): string | null {
  const { code } = splitLineComment(line);
  const escapedKey = key.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  const m = code.match(new RegExp(`^(\\s*)"${escapedKey}"\\s*:\\s*`));
  if (!m) {
    return null;
  }

  const valueStart = m[0].length;
  const rest = code.slice(valueStart);
  const restTrimEnd = rest.replace(/\s+$/, '');
  const tokenWithMaybeComma = restTrimEnd.endsWith(',')
    ? restTrimEnd.slice(0, -1)
    : restTrimEnd;

  return tokenWithMaybeComma.trim();
}

function wrapObjectText(params: { baseIndent: string; inner: string }): string {
  const { baseIndent } = params;

  const rawInner = params.inner;
  if (rawInner.trim() === '') {
    return `{\n${baseIndent}}`;
  }

  // Avoid introducing a blank line before the closing brace.
  const inner = rawInner.trimEnd();

  const withLeadingNewline = inner.startsWith('\n') ? inner : `\n${inner}`;
  const withTrailingNewline = withLeadingNewline.endsWith('\n')
    ? withLeadingNewline
    : `${withLeadingNewline}\n`;

  return `{${withTrailingNewline}${baseIndent}}`;
}

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function insertJsoncObjectPropertyAtStart(
  source: string,
  range: JsoncObjectRange,
  entry: { key: string; value: JsoncValue },
): { content: string; didChange: boolean } {
  const objectText = source.slice(range.start, range.end + 1);
  const inner = objectText.slice(1, -1);
  const lines = inner.split('\n');

  const baseIndent = getLineIndent(source, range.start);
  const defaultIndent = `${baseIndent}  `;

  let detectedIndent: string | null = null;
  let hasAnyProperty = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(/^(\s*)"([^"]+)"\s*:/);
    if (!m) {
      continue;
    }

    detectedIndent = detectedIndent ?? m[1] ?? '';
    hasAnyProperty = true;
    break;
  }

  const propertyIndent = detectedIndent ?? defaultIndent;
  const comma = hasAnyProperty ? ',' : '';
  const insertionLine = `${propertyIndent}"${entry.key}": ${formatJsoncValue(entry.value)}${comma}`;

  const insertionIdx = inner.startsWith('\n') ? 1 : 0;
  lines.splice(insertionIdx, 0, insertionLine);

  const updatedInner = lines.join('\n');
  const updatedObjectText = wrapObjectText({
    baseIndent,
    inner: updatedInner,
  });
  const updatedSource =
    source.slice(0, range.start) +
    updatedObjectText +
    source.slice(range.end + 1);

  return { content: updatedSource, didChange: true };
}

function insertJsoncObjectPropertyBeforeKey(
  source: string,
  range: JsoncObjectRange,
  entry: { key: string; value: JsoncValue },
  beforeKey: string,
): { content: string; didChange: boolean } | null {
  const objectText = source.slice(range.start, range.end + 1);
  const inner = objectText.slice(1, -1);
  const lines = inner.split('\n');

  const baseIndent = getLineIndent(source, range.start);
  const defaultIndent = `${baseIndent}  `;

  let detectedIndent: string | null = null;
  let hasAnyProperty = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(/^(\s*)"([^"]+)"\s*:/);
    if (!m) {
      continue;
    }

    detectedIndent = detectedIndent ?? m[1] ?? '';
    hasAnyProperty = true;
    break;
  }

  if (!hasAnyProperty) {
    return null;
  }

  const propertyIndent = detectedIndent ?? defaultIndent;
  const escapedBeforeKey = beforeKey
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"');
  const beforeKeyRegex = new RegExp(
    `^${escapeRegExp(propertyIndent)}"${escapedBeforeKey}"\\s*:`,
  );

  let beforeKeyLineIdx: number | null = null;
  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (line === undefined) {
      continue;
    }

    if (beforeKeyRegex.test(line)) {
      beforeKeyLineIdx = idx;
      break;
    }
  }

  if (beforeKeyLineIdx == null) {
    return null;
  }

  // Insert before the target key, and keep any immediately preceding comment
  // block with that key.
  const minIdx = inner.startsWith('\n') ? 1 : 0;
  let insertionIdx = beforeKeyLineIdx;
  while (insertionIdx > minIdx) {
    const prev = lines[insertionIdx - 1] ?? '';
    const trimmed = prev.trimStart();
    if (
      trimmed === '' ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      insertionIdx -= 1;
      continue;
    }

    break;
  }

  // Since we're inserting before an existing property, we always need a comma.
  const insertionLine = `${propertyIndent}"${entry.key}": ${formatJsoncValue(entry.value)},`;
  lines.splice(insertionIdx, 0, insertionLine);

  const updatedInner = lines.join('\n');
  const updatedObjectText = wrapObjectText({
    baseIndent,
    inner: updatedInner,
  });
  const updatedSource =
    source.slice(0, range.start) +
    updatedObjectText +
    source.slice(range.end + 1);

  return { content: updatedSource, didChange: true };
}

function insertJsoncObjectPropertyAfterKey(
  source: string,
  range: JsoncObjectRange,
  entry: { key: string; value: JsoncValue },
  afterKey: string,
): { content: string; didChange: boolean } | null {
  const objectText = source.slice(range.start, range.end + 1);
  const inner = objectText.slice(1, -1);
  const lines = inner.split('\n');

  const baseIndent = getLineIndent(source, range.start);
  const defaultIndent = `${baseIndent}  `;

  let detectedIndent: string | null = null;
  let hasAnyProperty = false;

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(/^(\s*)"([^"]+)"\s*:/);
    if (!m) {
      continue;
    }

    detectedIndent = detectedIndent ?? m[1] ?? '';
    hasAnyProperty = true;
    break;
  }

  if (!hasAnyProperty) {
    return null;
  }

  const propertyIndent = detectedIndent ?? defaultIndent;
  const escapedAfterKey = afterKey
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"');
  const afterKeyRegex = new RegExp(
    `^${escapeRegExp(propertyIndent)}"${escapedAfterKey}"\\s*:`,
  );
  const propertyRegex = new RegExp(
    `^${escapeRegExp(propertyIndent)}"([^"]+)"\\s*:`,
  );

  let afterKeyLineIdx: number | null = null;
  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (line === undefined) {
      continue;
    }

    if (afterKeyRegex.test(line)) {
      afterKeyLineIdx = idx;
      break;
    }
  }

  if (afterKeyLineIdx == null) {
    return null;
  }

  for (let idx = afterKeyLineIdx + 1; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (line === undefined) {
      continue;
    }

    const trimmed = line.trimStart();
    if (
      trimmed === '' ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(propertyRegex);
    const nextKey = m?.[1];
    if (nextKey === undefined) {
      continue;
    }

    return insertJsoncObjectPropertyBeforeKey(source, range, entry, nextKey);
  }

  // No next property at the same indentation level; avoid inserting at the end
  // because it may require editing the previous property's trailing comma.
  return null;
}

export function upsertJsoncObjectProperties(
  source: string,
  range: JsoncObjectRange,
  entries: readonly { key: string; value: JsoncValue }[],
): { content: string; didChange: boolean } {
  if (entries.length === 0) {
    return { content: source, didChange: false };
  }

  const objectText = source.slice(range.start, range.end + 1);
  const inner = objectText.slice(1, -1);
  const lines = inner.split('\n');

  const propertyLineIdxByKey = new Map<string, number>();
  let lastPropertyIdx = -1;
  let detectedIndent: string | null = null;

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    if (line === undefined) {
      continue;
    }

    const trimmed = line.trimStart();
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('*/')
    ) {
      continue;
    }

    const m = line.match(/^(\s*)"([^"]+)"\s*:/);
    if (!m) {
      continue;
    }

    const indent = m[1] ?? '';
    const key = m[2];
    if (key === undefined) {
      continue;
    }

    propertyLineIdxByKey.set(key, idx);
    lastPropertyIdx = idx;
    if (detectedIndent === null) {
      detectedIndent = indent;
    }
  }

  const baseIndent = getLineIndent(source, range.start);
  const defaultIndent = `${baseIndent}  `;
  const propertyIndent = detectedIndent ?? defaultIndent;

  let didChange = false;

  // Replace existing lines first.
  for (const { key, value } of entries) {
    const lineIdx = propertyLineIdxByKey.get(key);
    if (lineIdx == null) {
      continue;
    }

    const prev = lines[lineIdx] ?? '';
    const formatted = formatJsoncValue(value);
    const existingToken = readScalarTokenFromPropertyLine(prev, key);
    if (existingToken === formatted) {
      continue;
    }

    const { code, comment } = splitLineComment(prev);
    const codeTrimEnd = code.replace(/\s+$/, '');
    const trailing = code.slice(codeTrimEnd.length);
    const indentMatch = prev.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : propertyIndent;
    const comma = codeTrimEnd.endsWith(',') ? ',' : '';
    const nextLine = `${indent}"${key}": ${formatted}${comma}${trailing}${comment}`;

    lines[lineIdx] = nextLine;
    didChange = true;
  }

  const missing = entries.filter((e) => !propertyLineIdxByKey.has(e.key));
  if (missing.length > 0) {
    // Ensure the previous last property has a comma.
    if (lastPropertyIdx !== -1) {
      const prev = lines[lastPropertyIdx] ?? '';
      const nextLine = ensureTrailingComma(prev);
      if (nextLine !== prev) {
        lines[lastPropertyIdx] = nextLine;
        didChange = true;
      }
    }

    const insertionIdx =
      lastPropertyIdx === -1 ? lines.length - 1 : lastPropertyIdx + 1;
    const insertedLines = missing.map(({ key, value }, idx) => {
      const comma = idx < missing.length - 1 ? ',' : '';
      return `${propertyIndent}"${key}": ${formatJsoncValue(value)}${comma}`;
    });

    lines.splice(insertionIdx, 0, ...insertedLines);
    didChange = true;
  }

  if (!didChange) {
    return { content: source, didChange: false };
  }

  const updatedInner = lines.join('\n');
  const updatedObjectText = wrapObjectText({
    baseIndent,
    inner: updatedInner,
  });
  const updatedSource =
    source.slice(0, range.start) +
    updatedObjectText +
    source.slice(range.end + 1);

  return { content: updatedSource, didChange: true };
}

export function ensureJsoncObjectAtPath(
  source: string,
  path: readonly string[],
): { content: string; range: JsoncObjectRange } | null {
  if (path.length === 0) {
    return null;
  }

  let content = source;

  for (let idx = 0; idx < path.length; idx += 1) {
    const currentPath = path.slice(0, idx + 1);
    const existing = findJsoncObjectRangeForPath(content, currentPath);
    if (existing) {
      continue;
    }

    const parentPath = currentPath.slice(0, -1);
    const parentRange = findJsoncObjectRangeForPath(content, parentPath);
    if (!parentRange) {
      return null;
    }

    const key = currentPath[currentPath.length - 1];
    if (key === undefined) {
      return null;
    }

    const entry: { key: string; value: JsoncValue } = {
      key,
      value: { kind: 'raw', value: '{}' },
    };

    // Wrangler: keep root "vars" close to KV bindings.
    const edit =
      parentPath.length === 0 && key === 'vars'
        ? (insertJsoncObjectPropertyBeforeKey(
            content,
            parentRange,
            entry,
            'kv_namespaces',
          ) ??
          insertJsoncObjectPropertyAfterKey(
            content,
            parentRange,
            entry,
            'compatibility_flags',
          ) ??
          insertJsoncObjectPropertyAfterKey(
            content,
            parentRange,
            entry,
            'compatibility_date',
          ) ??
          insertJsoncObjectPropertyAfterKey(
            content,
            parentRange,
            entry,
            'main',
          ) ??
          insertJsoncObjectPropertyAfterKey(
            content,
            parentRange,
            entry,
            'name',
          ) ??
          insertJsoncObjectPropertyAfterKey(
            content,
            parentRange,
            entry,
            '$schema',
          ) ??
          insertJsoncObjectPropertyAtStart(content, parentRange, entry))
        : insertJsoncObjectPropertyAtStart(content, parentRange, entry);
    content = edit.content;
  }

  const range = findJsoncObjectRangeForPath(content, path);
  if (!range) {
    return null;
  }

  return { content, range };
}
