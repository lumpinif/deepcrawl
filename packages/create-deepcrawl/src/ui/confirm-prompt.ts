import { ConfirmPrompt, isCancel } from '@clack/core';
import { createUserAbortError } from '../lib/user-abort.js';
import { dimText } from './dim.js';
import {
  cyanText,
  grayText,
  greenText,
  redText,
  renderBinaryOption,
  SYMBOL,
  strikeText,
} from './terminal-style.js';

type ConfirmPromptInput = {
  message: string;
  description?: string;
  initialValue?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export async function promptConfirmValue(
  input: ConfirmPromptInput,
): Promise<boolean> {
  const value = await new ConfirmPrompt({
    active: input.activeLabel ?? 'Yes',
    inactive: input.inactiveLabel ?? 'No',
    initialValue: input.initialValue ?? true,
    render() {
      const yesLabel = input.activeLabel ?? 'Yes';
      const noLabel = input.inactiveLabel ?? 'No';
      const header = `${grayText(SYMBOL.bar)}
${renderStateSymbol(this.state)}  ${input.message}
`;
      const description = input.description
        ? `${grayText(SYMBOL.bar)}  ${dimText(input.description)}
`
        : '';

      switch (this.state) {
        case 'submit':
          return `${header}${description}${grayText(SYMBOL.bar)}  ${dimText(
            this.value ? yesLabel : noLabel,
          )}`;
        case 'cancel':
          return `${header}${description}${grayText(SYMBOL.bar)}  ${strikeText(
            dimText(this.value ? yesLabel : noLabel),
          )}
${grayText(SYMBOL.bar)}`;
        default:
          return `${header}${description}${cyanText(SYMBOL.bar)}  ${renderBinaryOption(
            {
              yesLabel,
              noLabel,
              value: this.value,
            },
          )}
${grayText(SYMBOL.corner)}`;
      }
    },
  }).prompt();

  if (isCancel(value)) {
    throw createUserAbortError();
  }

  return value as unknown as boolean;
}

function renderStateSymbol(
  state: 'initial' | 'active' | 'submit' | 'cancel' | 'error',
): string {
  switch (state) {
    case 'submit':
      return greenText(SYMBOL.submit);
    case 'cancel':
      return redText(SYMBOL.cancel);
    default:
      return cyanText(SYMBOL.active);
  }
}
