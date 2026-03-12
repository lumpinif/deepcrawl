const DEFAULT_WIDTH = 54;
const SECRET_BOX_WIDTH = 24;

function splitLongToken(value: string, width: number): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += width) {
    chunks.push(value.slice(index, index + width));
  }

  return chunks;
}

export function wrapCardValue(value: string, width = DEFAULT_WIDTH): string[] {
  const source = value.trim();
  if (!source) {
    return [''];
  }

  const lines: string[] = [];
  let remaining = source;

  while (remaining.length > width) {
    const slice = remaining.slice(0, width + 1);
    const breakIndex = Math.max(
      slice.lastIndexOf(' '),
      slice.lastIndexOf('/'),
      slice.lastIndexOf('?'),
      slice.lastIndexOf('&'),
      slice.lastIndexOf('='),
      slice.lastIndexOf('-'),
      slice.lastIndexOf(':'),
    );

    if (breakIndex >= Math.floor(width * 0.45)) {
      lines.push(remaining.slice(0, breakIndex + 1).trimEnd());
      remaining = remaining.slice(breakIndex + 1).trimStart();
      continue;
    }

    const chunks = splitLongToken(remaining, width);
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
  const rows = splitLongToken(secret, SECRET_BOX_WIDTH);
  const width = Math.max(...rows.map((row) => row.length));
  const top = `┌${'─'.repeat(width + 2)}┐`;
  const middle = rows.map((row) => `│ ${row.padEnd(width, ' ')} │`);
  const bottom = `└${'─'.repeat(width + 2)}┘`;

  return [top, ...middle, bottom];
}
