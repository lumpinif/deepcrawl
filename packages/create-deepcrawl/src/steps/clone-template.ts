import { runCommand } from '../lib/exec.js';

const DEFAULT_TEMPLATE_REPO =
  'https://github.com/lumpinif/deepcrawl.git' as const;
const DEFAULT_TEMPLATE_BRANCH = 'template/main' as const;

export async function cloneTemplateRepo({
  destDir,
  repo = DEFAULT_TEMPLATE_REPO,
  branch = DEFAULT_TEMPLATE_BRANCH,
}: {
  destDir: string;
  repo?: string;
  branch?: string;
}) {
  await runCommand(
    'git',
    ['clone', '--depth', '1', '--branch', branch, repo, destDir],
    { mode: 'inherit' },
  );
}
