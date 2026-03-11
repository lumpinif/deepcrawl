import { fileURLToPath } from 'node:url';
import { runCommand } from '../lib/exec.js';

function resolvePrepareTemplateScriptPath(): string {
  return fileURLToPath(
    new URL('../../scripts/prepare-template-output.mjs', import.meta.url),
  );
}

export async function prepareTemplateOutput({
  projectDir,
}: {
  projectDir: string;
}) {
  await runCommand('node', [resolvePrepareTemplateScriptPath(), projectDir], {
    mode: 'inherit',
  });
}
