const DEFAULT_WIDTH = 54;
const SECRET_BOX_WIDTH = 24;

type WrapCardValueOptions = {
  preserveLeadingWhitespace?: boolean;
};

function splitLongToken(value: string, width: number): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += width) {
    chunks.push(value.slice(index, index + width));
  }

  return chunks;
}

export function wrapCardValue(
  value: string,
  options: WrapCardValueOptions = {},
): string[] {
  const source = options.preserveLeadingWhitespace
    ? value.replace(/\s+$/g, '')
    : value.trim();
  if (!source.trim()) {
    return [''];
  }

  const lines: string[] = [];
  let remaining = source;

  while (remaining.length > DEFAULT_WIDTH) {
    const slice = remaining.slice(0, DEFAULT_WIDTH + 1);
    const breakIndex = Math.max(
      slice.lastIndexOf(' '),
      slice.lastIndexOf('/'),
      slice.lastIndexOf('?'),
      slice.lastIndexOf('&'),
      slice.lastIndexOf('='),
      slice.lastIndexOf('-'),
      slice.lastIndexOf(':'),
    );

    if (breakIndex >= Math.floor(DEFAULT_WIDTH * 0.45)) {
      lines.push(remaining.slice(0, breakIndex + 1).trimEnd());
      const nextLine = remaining.slice(breakIndex + 1);
      remaining = options.preserveLeadingWhitespace
        ? nextLine
        : nextLine.trimStart();
      continue;
    }

    const chunks = splitLongToken(remaining, DEFAULT_WIDTH);
    lines.push(...chunks.slice(0, -1));
    remaining = chunks.at(-1) ?? '';
    break;
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines;
}

export function indentLines(lines: string[], prefix = '  '): string[] {
  return lines.map((line) => `${prefix}${line}`);
}

export function renderSecretBox(secret: string): string[] {
  // Secret boxes are only rendered for generated or validated non-empty secrets.
  // Callers intentionally own that invariant so we do not show a misleading blank secret box.
  const rows = splitLongToken(secret, SECRET_BOX_WIDTH);
  const width = Math.max(...rows.map((row) => row.length));
  const top = `┌${'─'.repeat(width + 2)}┐`;
  const middle = rows.map((row) => `│ ${row.padEnd(width, ' ')} │`);
  const bottom = `└${'─'.repeat(width + 2)}┘`;

  return [top, ...middle, bottom];
}
