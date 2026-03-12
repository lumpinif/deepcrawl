import { patchV0WranglerConfigForDeployment } from './patch-v0-wrangler.js';
import {
  type V0LocalJwtSecretFiles,
  writeV0LocalJwtSecret,
} from './write-v0-local-jwt-secret.js';

type AuthMode = 'none' | 'jwt';

export async function prepareV0LocalProject({
  projectDir,
  projectName,
  authMode,
  enableActivityLogs,
  jwtIssuer,
  jwtAudience,
  jwtSecret,
}: {
  projectDir: string;
  projectName: string;
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
  jwtSecret?: string;
}): Promise<{
  localJwtSecretFiles?: V0LocalJwtSecretFiles;
}> {
  await patchV0WranglerConfigForDeployment({
    projectDir,
    projectName,
    authMode,
    enableActivityLogs,
    jwtIssuer,
    jwtAudience,
  });

  if (authMode !== 'jwt') {
    return {};
  }

  if (!jwtSecret) {
    throw new Error('JWT secret is missing.');
  }

  return {
    localJwtSecretFiles: writeV0LocalJwtSecret({
      projectDir,
      jwtSecret,
    }),
  };
}
