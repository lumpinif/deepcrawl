import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { cancel, isCancel, note, select, text } from '@clack/prompts';
import { generateJwtSecret } from '../lib/jwt.js';
import { createUserAbortError } from '../lib/user-abort.js';
import { getV0ResourceNamesForProject } from '../steps/provision-v0-resources.js';
import { promptConfirmValue } from './confirm-prompt.js';
import { promptDeploymentTarget } from './select-deployment-target.js';

export type AuthMode = 'none' | 'jwt';
export type DeploymentTarget = 'v0-api-worker';

export type Answers = {
  deploymentTarget: DeploymentTarget;
  projectName: string;
  parentDirectory: string;
  targetDirectory: string;
  authMode: AuthMode;
  jwtSecret?: string;
  jwtSecretWasGenerated?: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
  enableActivityLogs: boolean;
};

export type ProjectLocation = {
  projectName: string;
  parentDirectory: string;
  targetDirectory: string;
  requestedProjectName?: string;
  requestedTargetPath?: string;
};

type PromptAnswersInput = {
  cwd?: string;
  targetPath?: string;
};

type PromptResult<T> = T | symbol;

function resolvePromptValue<T>(value: PromptResult<T>): T {
  if (isCancel(value)) {
    cancel('Aborted by user.');
    throw createUserAbortError();
  }

  return value;
}

async function promptTextValue(input: {
  message: string;
  placeholder?: string;
  validate?: (value: string) => string | undefined;
}): Promise<string> {
  const value = resolvePromptValue(
    await text({
      message: input.message,
      placeholder: input.placeholder,
      validate: input.validate,
    }),
  );

  return value ?? '';
}

function resolveTargetDirectory(input: {
  cwd: string;
  parentDirectory: string;
  projectName: string;
}): string {
  if (isAbsolute(input.parentDirectory)) {
    return resolve(input.parentDirectory, input.projectName);
  }

  return resolve(input.cwd, input.parentDirectory, input.projectName);
}

export function normalizeProjectName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Project name is required.');
  }

  const kebab = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!kebab) {
    throw new Error('Project name must include at least one letter or number.');
  }

  return kebab;
}

export function resolveProjectLocation(input: {
  cwd: string;
  projectName: string;
  parentDirectory: string;
}): ProjectLocation {
  const parentDirectory = input.parentDirectory.trim() || '.';

  return {
    projectName: input.projectName,
    parentDirectory,
    targetDirectory: resolveTargetDirectory({
      cwd: input.cwd,
      parentDirectory,
      projectName: input.projectName,
    }),
  };
}

export function resolveProjectLocationFromTargetPath(input: {
  cwd: string;
  targetPath: string;
}): ProjectLocation {
  const requestedTargetPath = input.targetPath.trim();
  if (!requestedTargetPath) {
    throw new Error('Target path is required.');
  }

  const requestedProjectName = basename(requestedTargetPath);
  if (
    !requestedProjectName ||
    requestedProjectName === '.' ||
    requestedProjectName === '..'
  ) {
    throw new Error(
      'Target path must include the new project folder name. Example: ../my-app',
    );
  }

  const projectName = normalizeProjectName(requestedProjectName);
  const parentDirectory = dirname(requestedTargetPath);

  return {
    projectName,
    parentDirectory,
    targetDirectory: resolveTargetDirectory({
      cwd: input.cwd,
      parentDirectory,
      projectName,
    }),
    requestedProjectName,
    requestedTargetPath,
  };
}

function buildProjectLocationGuide(): string {
  return [
    "We'll create one new folder for your project.",
    '- Folder name: the new project folder.',
    '- Create in: the folder where it should go.',
    '- Example: my-app + .. = ../my-app',
    '- Tip: run npm create deepcrawl ../my-app to skip these questions.',
  ].join('\n');
}

function getDeploymentTargetLabel(target: DeploymentTarget): string {
  switch (target) {
    case 'v0-api-worker':
      return 'V0 API Worker only';
  }
}

export function buildDeploymentSummary(input: {
  answers: Pick<
    Answers,
    | 'deploymentTarget'
    | 'projectName'
    | 'parentDirectory'
    | 'targetDirectory'
    | 'authMode'
    | 'enableActivityLogs'
  >;
  requestedProjectName?: string;
  requestedTargetPath?: string;
}): string {
  const names = getV0ResourceNamesForProject(input.answers.projectName);
  const projectNameLine =
    input.requestedProjectName &&
    input.requestedProjectName !== input.answers.projectName
      ? `- Folder name: ${input.answers.projectName} (from "${input.requestedProjectName}")`
      : `- Folder name: ${input.answers.projectName}`;

  return [
    ...(input.requestedTargetPath
      ? [`- Path from command: ${input.requestedTargetPath}`]
      : []),
    projectNameLine,
    `- Create in: ${input.answers.parentDirectory}`,
    `- Full path: ${input.answers.targetDirectory}`,
    `- Deploy: ${getDeploymentTargetLabel(input.answers.deploymentTarget)}`,
    `- Auth: ${input.answers.authMode}`,
    `- Activity logs: ${input.answers.enableActivityLogs ? 'on' : 'off'}`,
    '- Cloudflare resources:',
    `  - D1: ${names.d1Name}`,
    `  - KV (links): ${names.linksTitle}`,
    `  - KV (read): ${names.readTitle}`,
  ].join('\n');
}

export async function promptAnswers(
  input: PromptAnswersInput = {},
): Promise<Answers> {
  const cwd = input.cwd ?? process.cwd();
  const deploymentTarget = await promptDeploymentTarget();

  let location: ProjectLocation;

  if (input.targetPath) {
    location = resolveProjectLocationFromTargetPath({
      cwd,
      targetPath: input.targetPath,
    });

    note(
      [
        "We'll use the path you passed on the command line.",
        `- Path: ${location.requestedTargetPath}`,
        location.requestedProjectName &&
        location.requestedProjectName !== location.projectName
          ? `- Folder name: ${location.projectName} (from "${location.requestedProjectName}")`
          : `- Folder name: ${location.projectName}`,
        `- Full path: ${location.targetDirectory}`,
      ].join('\n'),
      'Project folder',
    );
  } else {
    note(buildProjectLocationGuide(), 'Project folder');

    const rawName = await promptTextValue({
      message: 'Project name',
      placeholder: 'my-deepcrawl-app',
      validate: (value) => {
        try {
          normalizeProjectName(value);
          return;
        } catch (error) {
          return error instanceof Error
            ? error.message
            : 'Invalid project name.';
        }
      },
    });

    location = resolveProjectLocation({
      cwd,
      projectName: normalizeProjectName(rawName),
      parentDirectory: await promptTextValue({
        message: 'Create in',
        placeholder: '.',
      }),
    });
  }

  const authMode = resolvePromptValue(
    await select<AuthMode>({
      message: 'How should this API handle auth?',
      options: [
        {
          value: 'jwt',
          label: 'JWT',
          hint: 'Require a bearer token',
        },
        {
          value: 'none',
          label: 'No auth',
          hint: 'Open access',
        },
      ],
    }),
  );

  let jwtSecret: string | undefined;
  let jwtSecretWasGenerated = false;
  let jwtIssuer: string | undefined;
  let jwtAudience: string | undefined;

  if (authMode === 'jwt') {
    const rawSecret = await promptTextValue({
      message: 'JWT secret',
      placeholder: 'Leave blank to generate one',
    });
    const providedSecret = rawSecret.trim();
    if (providedSecret) {
      jwtSecret = providedSecret;
    } else {
      jwtSecret = generateJwtSecret();
      jwtSecretWasGenerated = true;
    }

    jwtIssuer = (
      await promptTextValue({
        message: 'JWT issuer (optional)',
        placeholder: 'Optional',
      })
    ).trim();

    jwtAudience = (
      await promptTextValue({
        message: 'JWT audience (optional)',
        placeholder: 'Optional',
      })
    ).trim();
  }

  const enableActivityLogs = await promptConfirmValue({
    message: 'Turn on activity logs?',
    description: 'Saves request history to help debug issues later.',
    initialValue: true,
    activeLabel: 'Yes (Recommended)',
    inactiveLabel: 'No',
  });

  note(
    buildDeploymentSummary({
      answers: {
        deploymentTarget,
        projectName: location.projectName,
        parentDirectory: location.parentDirectory,
        targetDirectory: location.targetDirectory,
        authMode,
        enableActivityLogs,
      },
      requestedProjectName: location.requestedProjectName,
      requestedTargetPath: location.requestedTargetPath,
    }),
    'Review',
  );

  const proceed = await promptConfirmValue({
    message: 'Deploy now?',
    initialValue: true,
    activeLabel: 'Yes',
    inactiveLabel: 'No',
  });

  if (!proceed) {
    cancel('Aborted by user.');
    throw createUserAbortError();
  }

  return {
    deploymentTarget,
    projectName: location.projectName,
    parentDirectory: location.parentDirectory,
    targetDirectory: location.targetDirectory,
    authMode,
    jwtSecret,
    jwtSecretWasGenerated,
    jwtIssuer,
    jwtAudience,
    enableActivityLogs,
  };
}
