'use client';

// import {z} from 'zod/v4';
import {
  DEFAULT_OPERATION_OPTIONS,
  RESULT_IDENTIFIER,
} from '@/hooks/playground/defaults';
import type {
  DeepcrawlOperations,
  OperationOptions,
  OperationToOptions,
} from '@/hooks/playground/types';
import { OPERATION_SCHEMAS } from '@/hooks/playground/types';
import { isEqual } from './deep-equal';

const INDENT = '  ';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      if (entry === undefined) {
        continue;
      }

      const sanitized = sanitizeValue(entry);

      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    }

    return result;
  }

  if (value === undefined) {
    return;
  }

  return value;
}

const NORMALIZED_DEFAULT_OPTIONS: OperationToOptions = {
  readUrl: sanitizeValue(
    OPERATION_SCHEMAS.readUrl.parse(DEFAULT_OPERATION_OPTIONS.readUrl),
  ) as OperationToOptions['readUrl'],
  getMarkdown: sanitizeValue(
    OPERATION_SCHEMAS.getMarkdown.parse(DEFAULT_OPERATION_OPTIONS.getMarkdown),
  ) as OperationToOptions['getMarkdown'],
  extractLinks: sanitizeValue(
    OPERATION_SCHEMAS.extractLinks.parse(
      DEFAULT_OPERATION_OPTIONS.extractLinks,
    ),
  ) as OperationToOptions['extractLinks'],
};

function normalizeOptions<Op extends DeepcrawlOperations>(
  operation: Op,
  value: OperationToOptions[Op],
): OperationToOptions[Op] {
  const schema = OPERATION_SCHEMAS[operation];
  const result = schema.safeParse(value);

  if (!result.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[playground] Invalid ${operation} options for SDK snippet.`,
        result.error.format(), // use following instead if needed
        // z.treeifyError(result.error),
      );
    }

    return NORMALIZED_DEFAULT_OPTIONS[operation] as OperationToOptions[Op];
  }

  return sanitizeValue(result.data) as OperationToOptions[Op];
}

function diffOptions(current: unknown, defaults: unknown): unknown | undefined {
  if (isEqual(current, defaults)) {
    return;
  }

  if (Array.isArray(current)) {
    return current;
  }

  if (isPlainObject(current)) {
    if (!isPlainObject(defaults)) {
      return current;
    }

    const keys = new Set([...Object.keys(current), ...Object.keys(defaults)]);
    const result: Record<string, unknown> = {};

    for (const key of keys) {
      const diffValue = diffOptions(
        (current as Record<string, unknown>)[key],
        (defaults as Record<string, unknown>)[key],
      );

      if (diffValue !== undefined) {
        result[key] = diffValue;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  if (current === undefined) {
    return;
  }

  return current;
}

function escapeString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function isValidIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function formatValue(value: unknown, level = 0): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    const nextIndent = INDENT.repeat(level + 1);
    const closingIndent = INDENT.repeat(level);
    const items = value.map(
      (item) => `${nextIndent}${formatValue(item, level + 1)},`,
    );

    return `[\n${items.join('\n')}\n${closingIndent}]`;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return '{}';
    }

    const nextIndent = INDENT.repeat(level + 1);
    const closingIndent = INDENT.repeat(level);
    const lines = entries.map(([key, entry]) => {
      const formatted = formatValue(entry, level + 1);
      const property = isValidIdentifier(key) ? key : `'${escapeString(key)}'`;

      return `${nextIndent}${property}: ${formatted},`;
    });

    return `{\n${lines.join('\n')}\n${closingIndent}}`;
  }

  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NaN';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'bigint') {
    return `${value}n`;
  }

  if (value === null) {
    return 'null';
  }

  return 'undefined';
}

export interface BuildSdkSnippetParams {
  operation: DeepcrawlOperations;
  requestUrl: string;
  options: OperationOptions;
}

export interface BuildSdkSnippetResult {
  code: string;
  hasCustomOptions: boolean;
}

export function buildSdkSnippet({
  operation,
  requestUrl,
  options,
}: BuildSdkSnippetParams): BuildSdkSnippetResult {
  const normalizedCurrent = normalizeOptions(operation, options);
  const normalizedDefaults = NORMALIZED_DEFAULT_OPTIONS[operation];
  const diff = diffOptions(normalizedCurrent, normalizedDefaults);
  const trimmedUrl = requestUrl.trim();
  const urlLiteral = formatValue(
    trimmedUrl.length > 0 ? trimmedUrl : 'https://example.com',
  );
  const identifier = RESULT_IDENTIFIER[operation];

  const callLine =
    diff !== undefined
      ? `const ${identifier} = await deepcrawl.${operation}(${urlLiteral}, ${formatValue(diff)});`
      : `const ${identifier} = await deepcrawl.${operation}(${urlLiteral});`;

  const lines = [
    "import { DeepcrawlApp } from 'deepcrawl';",
    '',
    'const deepcrawl = new DeepcrawlApp({',
    '  apiKey: process.env.DEEPCRAWL_API_KEY as string,',
    '});',
    '',
    callLine,
    '',
    `console.log(${identifier});`,
  ];

  return {
    code: lines.join('\n'),
    hasCustomOptions: diff !== undefined,
  };
}
