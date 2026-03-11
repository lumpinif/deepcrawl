import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

test('prepareTemplateOutput removes only the internal create-deepcrawl package', async () => {
  const scriptUrl = new URL(
    '../../scripts/prepare-template-output.mjs',
    import.meta.url,
  );
  const { prepareTemplateOutput } = (await import(scriptUrl.href)) as {
    prepareTemplateOutput: (targetDir?: string) => Promise<void>;
  };
  const projectDir = await mkdtemp(join(tmpdir(), 'prepare-template-output-'));
  const internalCliDir = join(projectDir, 'packages', 'create-deepcrawl');
  const keepDir = join(projectDir, 'packages', 'ui');
  const keepFile = join(keepDir, 'index.ts');

  await mkdir(internalCliDir, { recursive: true });
  await mkdir(keepDir, { recursive: true });
  await writeFile(join(internalCliDir, 'README.md'), '# internal\n', 'utf8');
  await writeFile(keepFile, 'export {};\n', 'utf8');

  await prepareTemplateOutput(projectDir);

  assert.equal(existsSync(internalCliDir), false);
  assert.equal(existsSync(keepDir), true);
  assert.equal(existsSync(keepFile), true);
});
