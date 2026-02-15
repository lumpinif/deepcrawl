import { runCommand } from '../lib/exec.js';

export type V0Resources = {
  d1: {
    databaseName: string;
    databaseId: string;
  };
  kv: {
    links: { id: string; previewId: string };
    read: { id: string; previewId: string };
  };
};

function normalizeResourceToken(raw: string): string {
  const token = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  if (!token) {
    throw new Error('Project name must include at least one letter or number.');
  }
  return token;
}

export function getV0ResourceNamesForProject(projectName: string): {
  d1Name: string;
  linksTitle: string;
  readTitle: string;
} {
  const base = normalizeResourceToken(projectName);
  return {
    d1Name: `${base}_API_DB`,
    linksTitle: `${base}_API_LINK_STORE`,
    readTitle: `${base}_API_READ_STORE`,
  };
}

function parseFirstMatch(text: string, regex: RegExp, label: string): string {
  const m = text.match(regex);
  const value = m?.[1];
  if (!value) {
    throw new Error(`Failed to parse ${label} from Wrangler output.`);
  }
  return value;
}

function parseDatabaseId(output: string): string {
  return parseFirstMatch(
    output,
    /database_id\s*=\s*"([^"]+)"/i,
    'D1 database_id',
  );
}

function parseKvId(output: string): string {
  // Wrangler prints a TOML snippet that includes: id = "..."
  return parseFirstMatch(output, /\bid\s*=\s*"([^"]+)"/i, 'KV namespace id');
}

async function createD1({
  cwd,
  name,
}: {
  cwd: string;
  name: string;
}): Promise<{ databaseName: string; databaseId: string }> {
  const result = await runCommand('wrangler', ['d1', 'create', name], {
    cwd,
    mode: 'pipe',
  });
  const output = `${result.stdout}\n${result.stderr}`;
  return { databaseName: name, databaseId: parseDatabaseId(output) };
}

async function createKvNamespace({
  cwd,
  title,
  preview,
}: {
  cwd: string;
  title: string;
  preview: boolean;
}): Promise<string> {
  const args = ['kv', 'namespace', 'create', title];
  if (preview) {
    args.push('--preview');
  }
  const result = await runCommand('wrangler', args, { cwd, mode: 'pipe' });
  const output = `${result.stdout}\n${result.stderr}`;
  return parseKvId(output);
}

export async function provisionV0Resources({
  projectDir,
  projectName,
}: {
  projectDir: string;
  projectName: string;
}): Promise<V0Resources> {
  const { d1Name, linksTitle, readTitle } =
    getV0ResourceNamesForProject(projectName);

  const d1 = await createD1({ cwd: projectDir, name: d1Name });

  const linksId = await createKvNamespace({
    cwd: projectDir,
    title: linksTitle,
    preview: false,
  });
  const linksPreviewId = await createKvNamespace({
    cwd: projectDir,
    title: linksTitle,
    preview: true,
  });

  const readId = await createKvNamespace({
    cwd: projectDir,
    title: readTitle,
    preview: false,
  });
  const readPreviewId = await createKvNamespace({
    cwd: projectDir,
    title: readTitle,
    preview: true,
  });

  return {
    d1,
    kv: {
      links: { id: linksId, previewId: linksPreviewId },
      read: { id: readId, previewId: readPreviewId },
    },
  };
}
