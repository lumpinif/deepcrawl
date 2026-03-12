import { dimText } from './dim.js';

export function color(code: number, value: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) {
    return value;
  }

  return `\x1b[${code}m${value}\x1b[0m`;
}

export function colorSequence(code: string, value: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) {
    return value;
  }

  return `\x1b[${code}m${value}\x1b[0m`;
}

export function grayText(value: string): string {
  return color(90, value);
}

export function cyanText(value: string): string {
  return color(36, value);
}

export function greenText(value: string): string {
  return color(32, value);
}

export function redText(value: string): string {
  return color(31, value);
}

export function yellowText(value: string): string {
  return color(33, value);
}

export function boldText(value: string): string {
  return color(1, value);
}

export function highlightText(value: string): string {
  return colorSequence('30;43', value);
}

export function strikeText(value: string): string {
  if (!process.stdout.isTTY || process.env.NO_COLOR) {
    return value;
  }

  return `\x1b[9m${value}\x1b[0m`;
}

export const SYMBOL = {
  submit: '◇',
  cancel: '■',
  active: '◆',
  bar: '│',
  corner: '└',
  activeItem: '●',
  inactiveItem: '○',
} as const;

export function renderBinaryOption(input: {
  yesLabel: string;
  noLabel: string;
  value: boolean;
}): string {
  return input.value
    ? `${greenText(SYMBOL.activeItem)} ${input.yesLabel} ${dimText('/')} ${dimText(SYMBOL.inactiveItem)} ${dimText(input.noLabel)}`
    : `${dimText(SYMBOL.inactiveItem)} ${dimText(input.yesLabel)} ${dimText('/')} ${greenText(SYMBOL.activeItem)} ${input.noLabel}`;
}
