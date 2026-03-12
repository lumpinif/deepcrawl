import { join } from 'node:path';
import { parse } from 'jsonc-parser';
import { setJsoncPath, updateWranglerJsonc } from '../lib/wrangler-config.js';
import type { V0Resources } from './provision-v0-resources.js';

type AuthMode = 'none' | 'jwt';

type WorkerVars = Record<string, string | boolean>;
type ParsedWranglerConfig = {
  d1_databases?: Array<{
    migrations_dir?: string;
  }>;
};

function normalizeWorkerName(projectName: string): string {
  const base = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) {
    throw new Error('Project name must include at least one letter or number.');
  }
  return `${base}-api-worker`;
}

function getExistingMigrationsDir(source: string): string | null {
  const data = parse(source) as ParsedWranglerConfig;
  const migrations = data?.d1_databases?.[0]?.migrations_dir;
  return typeof migrations === 'string' ? migrations : null;
}

function buildSharedWorkerVars(input: {
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
}): WorkerVars {
  return {
    AUTH_MODE: input.authMode,
    ENABLE_ACTIVITY_LOGS: input.enableActivityLogs,
    JWT_ISSUER: input.authMode === 'jwt' ? (input.jwtIssuer?.trim() ?? '') : '',
    JWT_AUDIENCE:
      input.authMode === 'jwt' ? (input.jwtAudience?.trim() ?? '') : '',
    ENABLE_API_RATE_LIMIT: false,
  };
}

function buildRootVars(input: {
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
}): WorkerVars {
  return {
    ...buildSharedWorkerVars(input),
    WORKER_NODE_ENV: 'development',
  };
}

function buildProductionVars(input: {
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
}): WorkerVars {
  return {
    ...buildSharedWorkerVars(input),
    WORKER_NODE_ENV: 'production',
  };
}

export async function patchV0WranglerConfigForDeployment({
  projectDir,
  projectName,
  authMode,
  enableActivityLogs,
  jwtIssuer,
  jwtAudience,
  resources,
}: {
  projectDir: string;
  projectName: string;
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
  resources?: V0Resources;
}) {
  const configPath = join(
    projectDir,
    'apps',
    'workers',
    'v0',
    'wrangler.jsonc',
  );

  await updateWranglerJsonc({
    filePath: configPath,
    update: (source) => {
      let next = source;

      // v0-only: do not ship Deepcrawl's custom domain or auth worker bindings.
      next = setJsoncPath(next, ['routes'], undefined);
      next = setJsoncPath(next, ['services'], undefined);
      next = setJsoncPath(next, ['env', 'production', 'services'], undefined);

      // Give the worker a per-project name to avoid collisions.
      next = setJsoncPath(next, ['name'], normalizeWorkerName(projectName));

      const rootVars = buildRootVars({
        authMode,
        enableActivityLogs,
        jwtIssuer,
        jwtAudience,
      });
      const deploymentVars = buildProductionVars({
        authMode,
        enableActivityLogs,
        jwtIssuer,
        jwtAudience,
      });

      // Rebuild root vars too so local Wrangler config stays aligned with the
      // generated production environment and does not inherit Deepcrawl's
      // official public URLs or OAuth identifiers.
      next = setJsoncPath(next, ['vars'], rootVars);

      // Rebuild production vars from an allowlist so template defaults never leak
      // Deepcrawl's official URLs or OAuth public identifiers into user deployments.
      next = setJsoncPath(next, ['env', 'production', 'vars'], deploymentVars);

      if (resources) {
        const migrationsDir =
          getExistingMigrationsDir(source) ??
          '../../../packages/db/db-d1/drizzle';

        next = setJsoncPath(
          next,
          ['d1_databases'],
          [
            {
              binding: 'DB_V0',
              remote: true,
              database_name: resources.d1.databaseName,
              database_id: resources.d1.databaseId,
              migrations_dir: migrationsDir,
            },
          ],
        );
        next = setJsoncPath(
          next,
          ['env', 'production', 'd1_databases'],
          [
            {
              binding: 'DB_V0',
              database_name: resources.d1.databaseName,
              database_id: resources.d1.databaseId,
              migrations_dir: migrationsDir,
            },
          ],
        );

        next = setJsoncPath(
          next,
          ['kv_namespaces'],
          [
            {
              remote: true,
              binding: 'DEEPCRAWL_V0_LINKS_STORE',
              id: resources.kv.links.id,
              preview_id: resources.kv.links.previewId,
            },
            {
              remote: true,
              binding: 'DEEPCRAWL_V0_READ_STORE',
              id: resources.kv.read.id,
              preview_id: resources.kv.read.previewId,
            },
          ],
        );
        next = setJsoncPath(
          next,
          ['env', 'production', 'kv_namespaces'],
          [
            {
              binding: 'DEEPCRAWL_V0_LINKS_STORE',
              id: resources.kv.links.id,
              preview_id: resources.kv.links.previewId,
            },
            {
              binding: 'DEEPCRAWL_V0_READ_STORE',
              id: resources.kv.read.id,
              preview_id: resources.kv.read.previewId,
            },
          ],
        );
      }

      return next;
    },
  });
}
