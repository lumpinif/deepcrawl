import { isCancel, Prompt } from '@clack/core';
import { createUserAbortError } from '../lib/user-abort.js';
import { dimText } from './dim.js';
import type { DeploymentTarget } from './prompt-answers.js';
import {
  cyanText,
  grayText,
  greenText,
  redText,
  SYMBOL,
  strikeText,
} from './terminal-style.js';

type DeploymentTargetOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

function renderOption(
  option: DeploymentTargetOption,
  state: 'active' | 'inactive' | 'selected' | 'cancelled',
): string {
  const label = option.hint ? `${option.label} (${option.hint})` : option.label;

  if (state === 'selected') {
    return dimText(label);
  }

  if (state === 'cancelled') {
    return strikeText(dimText(label));
  }

  if (option.disabled) {
    return `${grayText(SYMBOL.inactiveItem)} ${dimText(label)}`;
  }

  if (state === 'active') {
    return `${greenText(SYMBOL.activeItem)} ${label}`;
  }

  return `${dimText(SYMBOL.inactiveItem)} ${dimText(label)}`;
}

class DeploymentTargetPrompt extends Prompt {
  options: DeploymentTargetOption[];
  cursor: number;

  constructor(input: {
    message: string;
    options: DeploymentTargetOption[];
    initialValue?: string;
  }) {
    super(
      {
        render: () => this.renderPrompt(input.message),
      },
      false,
    );

    this.options = input.options;
    this.cursor = this.resolveInitialCursor(input.initialValue);
    this.changeValue();

    this.on('cursor', (direction) => {
      switch (direction) {
        case 'left':
        case 'up':
          this.moveCursor(-1);
          break;
        case 'down':
        case 'right':
          this.moveCursor(1);
          break;
        default:
          break;
      }

      this.changeValue();
    });
  }

  private renderPrompt(message: string): string {
    const header = `${grayText(SYMBOL.bar)}
${this.renderStateSymbol()}  ${message}
`;

    switch (this.state) {
      case 'submit':
        return `${header}${grayText(SYMBOL.bar)}  ${renderOption(this.currentOption(), 'selected')}
${grayText(SYMBOL.corner)}`;
      case 'cancel':
        return `${header}${grayText(SYMBOL.bar)}  ${renderOption(this.currentOption(), 'cancelled')}
${grayText(SYMBOL.bar)}`;
      default:
        return `${header}${this.options
          .map(
            (option, index) =>
              `${cyanText(SYMBOL.bar)}  ${renderOption(
                option,
                index === this.cursor ? 'active' : 'inactive',
              )}`,
          )
          .join('\n')}
${grayText(SYMBOL.corner)}`;
    }
  }

  private renderStateSymbol(): string {
    switch (this.state) {
      case 'submit':
        return greenText(SYMBOL.submit);
      case 'cancel':
        return redText(SYMBOL.cancel);
      default:
        return cyanText(SYMBOL.active);
    }
  }

  private resolveInitialCursor(initialValue?: string): number {
    const preferredIndex = this.options.findIndex(
      (option) => option.value === initialValue && !option.disabled,
    );

    if (preferredIndex >= 0) {
      return preferredIndex;
    }

    const firstEnabledIndex = this.options.findIndex(
      (option) => !option.disabled,
    );
    return firstEnabledIndex >= 0 ? firstEnabledIndex : 0;
  }

  private moveCursor(step: -1 | 1) {
    let nextCursor = this.cursor;

    do {
      nextCursor =
        (nextCursor + step + this.options.length) % this.options.length;
    } while (this.options[nextCursor]?.disabled);

    this.cursor = nextCursor;
  }

  private changeValue() {
    this.value = this.currentOption().value;
  }

  private currentOption(): DeploymentTargetOption {
    const option = this.options[this.cursor];
    if (!option) {
      throw new Error(
        'No deployment target option found at the current cursor.',
      );
    }

    return option;
  }
}

export function getDeploymentTargetOptions(): DeploymentTargetOption[] {
  return [
    {
      value: 'v0-api-worker',
      label: 'V0 API Worker only',
      hint: 'Available now',
    },
    {
      value: 'dashboard-api',
      label: 'Dashboard app + API',
      hint: 'Supporting soon',
      disabled: true,
    },
    {
      value: 'fullstack',
      label: 'Fullstack app + auth + API',
      hint: 'Supporting soon',
      disabled: true,
    },
    {
      value: 'custom-domains',
      label: 'Custom domains and routes',
      hint: 'Supporting soon',
      disabled: true,
    },
  ];
}

export async function promptDeploymentTarget(): Promise<DeploymentTarget> {
  const value = await new DeploymentTargetPrompt({
    message: 'What would you like to deploy?',
    options: getDeploymentTargetOptions(),
    initialValue: 'v0-api-worker',
  }).prompt();

  if (isCancel(value)) {
    throw createUserAbortError();
  }

  return value as DeploymentTarget;
}
