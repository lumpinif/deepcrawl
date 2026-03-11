import { findJsoncObjectRangeForPath } from './_jsonc';

type JsoncRange = { start: number; end: number };

function isWhitespace(ch: string | undefined): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

function skipTrivia(source: string, start: number): number {
  let i = start;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    // UTF-8 BOM
    if (ch === '\ufeff') {
      i += 1;
      continue;
    }

    if (isWhitespace(ch)) {
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

function readString(
  source: string,
  start: number,
): { value: string; end: number } | null {
  if (source[start] !== '"') {
    return null;
  }

  let i = start + 1;
  let value = '';
  let escaped = false;

  while (i < source.length) {
    const ch = source[i];
    if (ch === undefined) {
      break;
    }

    if (escaped) {
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

function findMatchingBracket(source: string, start: number): number | null {
  if (source[start] !== '[') {
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
    if (ch === undefined) {
      break;
    }

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

    if (ch === '[') {
      depth += 1;
      i += 1;
      continue;
    }

    if (ch === ']') {
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
    if (ch === undefined) {
      break;
    }

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

function findPropertyRemovalRangeInObject(
  source: string,
  object: JsoncRange,
  key: string,
): JsoncRange | null {
  let i = object.start + 1;

  let objectDepth = 1;
  let arrayDepth = 0;

  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < object.end) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === undefined) {
      break;
    }

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

    if (ch === '"') {
      if (objectDepth === 1 && arrayDepth === 0) {
        const parsed = readString(source, i);
        if (parsed && parsed.value === key) {
          const afterKey = skipTrivia(source, parsed.end);
          if (source[afterKey] === ':') {
            const propertyLineStart = source.lastIndexOf('\n', i);
            const removalStart =
              propertyLineStart === -1 ? 0 : propertyLineStart + 1;

            const valueStart = skipTrivia(source, afterKey + 1);
            const valueFirst = source[valueStart];
            if (valueFirst === undefined) {
              return null;
            }

            let valueEnd: number | null = null;
            if (valueFirst === '{') {
              valueEnd = findMatchingBrace(source, valueStart);
            } else if (valueFirst === '[') {
              valueEnd = findMatchingBracket(source, valueStart);
            } else if (valueFirst === '"') {
              const str = readString(source, valueStart);
              valueEnd = str ? str.end - 1 : null;
            } else {
              // scalar: read until comma or newline
              let j = valueStart;
              while (j < source.length) {
                const cj = source[j];
                if (cj === undefined) {
                  break;
                }
                if (cj === ',' || cj === '\n' || cj === '\r') {
                  break;
                }
                j += 1;
              }
              valueEnd = j - 1;
            }

            if (valueEnd == null) {
              return null;
            }

            let removalEnd = valueEnd + 1;
            removalEnd = skipTrivia(source, removalEnd);

            // Include trailing comma if present.
            if (source[removalEnd] === ',') {
              removalEnd += 1;
            }

            // Consume trailing whitespace and the following newline (single-line property)
            while (removalEnd < source.length) {
              const endCh = source[removalEnd];
              if (endCh === undefined) {
                break;
              }
              if (endCh === '\n') {
                removalEnd += 1;
                break;
              }
              if (!isWhitespace(endCh)) {
                // Don't eat into the next token; stop at first non-whitespace.
                break;
              }
              removalEnd += 1;
            }

            return { start: removalStart, end: removalEnd };
          }
        }
      }

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
      objectDepth += 1;
      i += 1;
      continue;
    }

    if (ch === '}') {
      objectDepth -= 1;
      i += 1;
      continue;
    }

    if (ch === '[') {
      arrayDepth += 1;
      i += 1;
      continue;
    }

    if (ch === ']') {
      arrayDepth -= 1;
      i += 1;
      continue;
    }

    i += 1;
  }

  return null;
}

function removePropertyAtPath(
  source: string,
  path: readonly string[],
  key: string,
): { content: string; didChange: boolean } {
  const objectRange = findJsoncObjectRangeForPath(source, path);
  if (!objectRange) {
    return { content: source, didChange: false };
  }

  const removal = findPropertyRemovalRangeInObject(source, objectRange, key);
  if (!removal) {
    return { content: source, didChange: false };
  }

  const content = source.slice(0, removal.start) + source.slice(removal.end);
  return { content, didChange: true };
}

export function stripWranglerJsoncServices(source: string): {
  content: string;
  didChange: boolean;
} {
  let content = source;
  let didChange = false;

  // v0-only deployments should not require any service bindings.
  const root = removePropertyAtPath(content, [], 'services');
  content = root.content;
  didChange ||= root.didChange;

  const prod = removePropertyAtPath(content, ['env', 'production'], 'services');
  content = prod.content;
  didChange ||= prod.didChange;

  return { content, didChange };
}
