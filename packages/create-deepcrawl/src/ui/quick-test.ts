import { isCancel, note, select, text } from '@clack/prompts';
import { isUserAbortError } from '../lib/user-abort.js';
import type {
  QuickTestKind,
  QuickTestResult,
} from '../steps/quick-test-v0-worker.js';
import { indentLines, wrapCardValue } from './card-format.js';
import { promptConfirmValue } from './confirm-prompt.js';
import {
  boldText,
  cyanText,
  greenText,
  highlightText,
  yellowText,
} from './terminal-style.js';

export type QuickTestInput = {
  kind: QuickTestKind;
  targetUrl: string;
};

const DEFAULT_QUICK_TEST_URL = 'https://example.com';

function resolveOptionalPromptValue<T>(value: T | symbol): T | null {
  if (isCancel(value)) {
    return null;
  }

  return value;
}

function formatStatus(result: QuickTestResult): string {
  if (result.statusCode === 0) {
    return result.statusText;
  }

  return `${result.statusCode} ${result.statusText}`;
}

function wrapMultilineValue(value: string): string[] {
  return value.split('\n').flatMap((line) => wrapCardValue(line));
}

export async function promptTryYourApiNow(): Promise<boolean> {
  return promptTryYourApiNowWithMode();
}

export async function promptTryYourApiNowWithMode(
  previewMode = false,
): Promise<boolean> {
  try {
    return await promptConfirmValue({
      message: 'Try your API now?',
      description: previewMode
        ? 'Run a simulated test request preview.'
        : 'Run one live test request against your new API.',
      initialValue: true,
      activeLabel: 'Yes',
      inactiveLabel: 'No',
    });
  } catch (error) {
    if (isUserAbortError(error)) {
      return false;
    }

    throw error;
  }
}

export async function promptQuickTestInput(
  previewMode = false,
): Promise<QuickTestInput | null> {
  note(
    previewMode
      ? 'We can preview this test flow right now.'
      : 'We can test your API right now.',
    'Quick test',
  );

  const kind = resolveOptionalPromptValue(
    await select<QuickTestKind>({
      message: 'Pick a test',
      options: [
        {
          value: 'read',
          label: 'Read a page',
          hint: 'Fetch page content',
        },
        {
          value: 'links',
          label: 'Extract links',
          hint: 'Return page links',
        },
      ],
    }),
  );

  if (!kind) {
    return null;
  }

  const targetUrl = resolveOptionalPromptValue(
    await text({
      message: 'URL to test',
      initialValue: DEFAULT_QUICK_TEST_URL,
      validate(value) {
        const trimmed = value.trim() || DEFAULT_QUICK_TEST_URL;

        try {
          const url = new URL(trimmed);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return 'Use a URL that starts with http:// or https://';
          }
          return;
        } catch {
          return 'Enter a valid URL, for example https://example.com';
        }
      },
    }),
  );

  if (!targetUrl) {
    return null;
  }

  return {
    kind,
    targetUrl: targetUrl.trim() || DEFAULT_QUICK_TEST_URL,
  };
}

function addSection(lines: string[], title: string, values: string[]) {
  if (lines.length > 0) {
    lines.push('');
  }

  lines.push(title);
  lines.push(...values);
}

function formatQuickTestAuth(authLabel: string): string[] {
  if (authLabel.startsWith('Temporary JWT')) {
    return [
      `${greenText('✅')} ${boldText('Temporary test JWT')}`,
      ...indentLines(wrapCardValue('Signed from your saved JWT settings.')),
    ];
  }

  if (authLabel === 'No auth required') {
    return [`${greenText('✅')} No auth required`];
  }

  return indentLines(wrapCardValue(authLabel));
}

export function buildQuickTestSuccessCard(
  result: QuickTestResult,
  previewMode = false,
): string {
  const lines: string[] = [];

  if (previewMode) {
    addSection(
      lines,
      `${highlightText(' PREVIEW ONLY ')} ${yellowText('🧪 This is a simulated test result.')}`,
      [],
    );
  }

  addSection(lines, boldText('🧪 Request'), [
    ...indentLines(wrapCardValue(result.requestPath).map(cyanText)),
  ]);
  addSection(lines, boldText('🔐 Auth'), formatQuickTestAuth(result.authLabel));
  addSection(lines, boldText('✅ Status'), [
    ...indentLines(wrapCardValue(greenText(formatStatus(result)))),
  ]);
  addSection(lines, boldText('📄 Response preview'), [
    ...indentLines(wrapMultilineValue(result.preview)),
  ]);
  addSection(lines, boldText('📋 Reuse this command'), [
    ...indentLines(wrapCardValue(result.curlCommand).map(cyanText)),
  ]);

  if (result.authLabel.startsWith('Temporary JWT')) {
    lines.push('');
    lines.push(
      `${highlightText(' TEMP TOKEN ')} ${yellowText(
        'Expires in about 15 minutes.',
      )}`,
    );
  }

  return lines.join('\n');
}

export function buildQuickTestFailureCard(result: QuickTestResult): string {
  const lines: string[] = [];

  addSection(
    lines,
    `${highlightText(' QUICK TEST FAILED ')} ${yellowText('⚠ Check the response below.')}`,
    [],
  );
  addSection(lines, boldText('🧪 Request'), [
    ...indentLines(wrapCardValue(result.requestPath).map(cyanText)),
  ]);
  addSection(lines, boldText('🔐 Auth'), formatQuickTestAuth(result.authLabel));
  addSection(lines, boldText('⚠ Status'), [
    ...indentLines(wrapCardValue(yellowText(formatStatus(result)))),
  ]);
  addSection(lines, boldText('📄 What came back'), [
    ...indentLines(wrapMultilineValue(result.preview)),
  ]);
  addSection(lines, boldText('📋 Try again with'), [
    ...indentLines(wrapCardValue(result.curlCommand).map(cyanText)),
  ]);

  if (result.authLabel.startsWith('Temporary JWT')) {
    lines.push('');
    lines.push(
      `${highlightText(' TEMP TOKEN ')} ${yellowText(
        'Expires in about 15 minutes.',
      )}`,
    );
  }

  return lines.join('\n');
}
