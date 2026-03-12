function escapeControlCharacter(value: string): string {
  if (value === '\t') {
    return '\\t';
  }

  if (value === '\r') {
    return '\\r';
  }

  return `\\u${value.codePointAt(0)?.toString(16).padStart(4, '0')}`;
}

function shouldEscapeControlCharacter(value: string): boolean {
  const codePoint = value.codePointAt(0);
  if (codePoint === undefined) {
    return false;
  }

  return (
    codePoint <= 0x09 ||
    (codePoint >= 0x0b && codePoint <= 0x1f) ||
    (codePoint >= 0x7f && codePoint <= 0x9f)
  );
}

export function sanitizeTerminalText(value: string): string {
  return Array.from(value.replace(/\r\n/g, '\n'), (char) =>
    shouldEscapeControlCharacter(char) ? escapeControlCharacter(char) : char,
  ).join('');
}
