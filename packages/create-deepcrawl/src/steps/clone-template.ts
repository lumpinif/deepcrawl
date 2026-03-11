import { existsSync } from 'node:fs';
import { runCommand } from '../lib/exec.js';
import type { TemplateSourceConfig } from '../lib/template-source.js';

async function assertLocalTemplateRepo(
  source: string,
  run: typeof runCommand = runCommand,
) {
  if (!existsSync(source)) {
    throw new Error(`Local template source not found: ${source}`);
  }

  const result = await run(
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
  run = runCommand,
}: {
  destDir: string;
  template: TemplateSourceConfig;
  run?: typeof runCommand;
}) {
  if (template.sourceKind === 'local') {
    await assertLocalTemplateRepo(template.source, run);
  }

  const args = ['clone'];

  if (template.sourceKind !== 'local') {
    args.push('--depth', '1');
  }

  args.push('--branch', template.branch, template.source, destDir);

  await run('git', args, { mode: 'inherit' });
}
