import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';

export const DEFAULT_TEMPLATE_REPO =
  'https://github.com/lumpinif/deepcrawl.git' as const;
export const DEFAULT_TEMPLATE_BRANCH = 'template/main' as const;

export type TemplateSourceConfig = {
  source: string;
  branch: string;
  isOverride: boolean;
  sourceKind: 'official' | 'local' | 'remote';
};

function isRemoteTemplateSource(value: string): boolean {
  return (
    value.includes('://') ||
    value.startsWith('git@') ||
    value.startsWith('ssh://')
  );
}

function expandHomeDir(value: string): string {
  if (value === '~') {
    return homedir();
  }

  if (value.startsWith('~/')) {
    return resolve(homedir(), value.slice(2));
  }

  return value;
}

function isLikelyLocalPath(raw: string): boolean {
  const value = expandHomeDir(raw);
  return (
    isAbsolute(value) ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.includes('/') ||
    value.includes('\\') ||
    existsSync(value)
  );
}

function normalizeLocalTemplateSource(value: string, cwd: string): string {
  const expanded = expandHomeDir(value);
  return isAbsolute(expanded) ? expanded : resolve(cwd, expanded);
}

export function resolveTemplateSourceConfig({
  cwd,
  templateSource,
  templateBranch,
}: {
  cwd: string;
  templateSource?: string;
  templateBranch?: string;
}): TemplateSourceConfig {
  if (!(templateSource || templateBranch)) {
    return {
      source: DEFAULT_TEMPLATE_REPO,
      branch: DEFAULT_TEMPLATE_BRANCH,
      isOverride: false,
      sourceKind: 'official',
    };
  }

  if (!templateSource && templateBranch) {
    return {
      source: DEFAULT_TEMPLATE_REPO,
      branch: templateBranch,
      isOverride: true,
      sourceKind: 'official',
    };
  }

  if (!(templateSource && templateBranch)) {
    throw new Error(
      'The internal template override requires both --template-source and --template-branch.',
    );
  }

  if (isRemoteTemplateSource(templateSource)) {
    return {
      source: templateSource,
      branch: templateBranch,
      isOverride: true,
      sourceKind: 'remote',
    };
  }

  if (isLikelyLocalPath(templateSource)) {
    return {
      source: normalizeLocalTemplateSource(templateSource, cwd),
      branch: templateBranch,
      isOverride: true,
      sourceKind: 'local',
    };
  }

  return {
    source: templateSource,
    branch: templateBranch,
    isOverride: true,
    sourceKind: 'remote',
  };
}
