import { boldText, cyanText, grayText } from './terminal-style.js';

const MAX_INNER_WIDTH = 60;

// This width helper only strips simple ANSI styling so borders stay aligned.
// Untrusted text must be sanitized before it reaches renderCliCard.
function stripAnsi(value: string): string {
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== '\u001b') {
      result += value[index];
      continue;
    }

    const start = index;
    if (value[index + 1] !== '[') {
      continue;
    }

    index += 2;
    while (index < value.length) {
      const char = value[index];
      if (!(char && /[0-9;]/.test(char))) {
        break;
      }
      index += 1;
    }

    if (value[index] === 'm') {
      continue;
    }

    index = start;
    result += value[index];
  }

  return result;
}

function visibleLength(value: string): number {
  return stripAnsi(value).length;
}

function padVisible(value: string, width: number): string {
  const padding = Math.max(0, width - visibleLength(value));
  return `${value}${' '.repeat(padding)}`;
}

export function renderCliCard(title: string, body: string): string {
  const lines = body.split('\n');
  const innerWidth = Math.min(
    Math.max(...lines.map((line) => visibleLength(line)), 0),
    MAX_INNER_WIDTH,
  );

  const top = grayText(`┌${'─'.repeat(innerWidth + 2)}┐`);
  const bottom = grayText(`└${'─'.repeat(innerWidth + 2)}┘`);
  const middle = lines.map((line) => {
    return `${grayText('│')} ${padVisible(line, innerWidth)} ${grayText('│')}`;
  });

  return [`${cyanText('◆')}  ${boldText(title)}`, top, ...middle, bottom].join(
    '\n',
  );
}
