import { join } from 'node:path';
import { upsertEnvFile } from '../lib/env-file.js';

export type V0LocalJwtSecretFiles = {
  devVarsPath: string;
  productionDevVarsPath: string;
};

export function writeV0LocalJwtSecret({
  projectDir,
  jwtSecret,
}: {
  projectDir: string;
  jwtSecret: string;
}): V0LocalJwtSecretFiles {
  const devVarsPath = join(projectDir, 'apps', 'workers', 'v0', '.dev.vars');
  const productionDevVarsPath = join(
    projectDir,
    'apps',
    'workers',
    'v0',
    '.dev.vars.production',
  );

  upsertEnvFile(devVarsPath, { JWT_SECRET: jwtSecret });
  upsertEnvFile(productionDevVarsPath, { JWT_SECRET: jwtSecret });

  return {
    devVarsPath,
    productionDevVarsPath,
  };
}
