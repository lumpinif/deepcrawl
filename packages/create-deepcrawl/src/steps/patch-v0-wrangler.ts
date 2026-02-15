import { join } from 'node:path';
import { parse } from 'jsonc-parser';
import { setJsoncPath, updateWranglerJsonc } from '../lib/wrangler-config.js';
import type { V0Resources } from './provision-v0-resources.js';

type AuthMode = 'none' | 'jwt';

function normalizeWorkerName(projectName: string): string {
  const base = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-api-worker`;
}

function getExistingMigrationsDir(source: string): string | null {
  const data = parse(source) as any;
  const migrations = data?.d1_databases?.[0]?.migrations_dir;
  return typeof migrations === 'string' ? migrations : null;
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

      // Minimal production vars for v0-only MVP.
      next = setJsoncPath(
        next,
        ['env', 'production', 'vars', 'AUTH_MODE'],
        authMode,
      );
      next = setJsoncPath(
        next,
        ['env', 'production', 'vars', 'ENABLE_ACTIVITY_LOGS'],
        enableActivityLogs,
      );
      next = setJsoncPath(
        next,
        ['env', 'production', 'vars', 'WORKER_NODE_ENV'],
        'production',
      );

      if (authMode === 'jwt') {
        next = setJsoncPath(
          next,
          ['env', 'production', 'vars', 'JWT_ISSUER'],
          jwtIssuer?.trim() ?? '',
        );
        next = setJsoncPath(
          next,
          ['env', 'production', 'vars', 'JWT_AUDIENCE'],
          jwtAudience?.trim() ?? '',
        );
      } else {
        // Keep vars present but empty for discoverability.
        next = setJsoncPath(
          next,
          ['env', 'production', 'vars', 'JWT_ISSUER'],
          '',
        );
        next = setJsoncPath(
          next,
          ['env', 'production', 'vars', 'JWT_AUDIENCE'],
          '',
        );
      }

      // Default to no rate limiting for MVP.
      next = setJsoncPath(
        next,
        ['env', 'production', 'vars', 'ENABLE_API_RATE_LIMIT'],
        false,
      );

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
