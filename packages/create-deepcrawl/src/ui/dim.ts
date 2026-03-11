export function dimText(value: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) {
    return value;
  }

  return `\x1b[2m${value}\x1b[0m`;
}
