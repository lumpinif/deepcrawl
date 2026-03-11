import { existsSync } from 'node:fs';
import { runCommand } from '../lib/exec.js';
import type { TemplateSourceConfig } from '../lib/template-source.js';

async function assertLocalTemplateRepo(source: string) {
  if (!existsSync(source)) {
    throw new Error(`Local template source not found: ${source}`);
  }

  const result = await runCommand(
    'git',
    ['-C', source, 'rev-parse', '--is-inside-work-tree'],
    {
      allowFailure: true,
      mode: 'pipe',
    },
  );

  if (result.exitCode !== 0 || result.stdout.trim() !== 'true') {
    throw new Error(
      `Local template source must be a git working tree: ${source}`,
    );
  }
}

export async function cloneTemplateRepo({
  destDir,
  template,
}: {
  destDir: string;
  template: TemplateSourceConfig;
}) {
  if (template.sourceKind === 'local') {
    await assertLocalTemplateRepo(template.source);
  }

  await runCommand(
    'git',
    [
      'clone',
      '--depth',
      '1',
      '--branch',
      template.branch,
      template.source,
      destDir,
    ],
    { mode: 'inherit' },
  );
}
