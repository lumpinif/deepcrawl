import type { V0LocalJwtSecretFiles } from '../steps/write-v0-local-jwt-secret.js';
import { indentLines, renderSecretBox, wrapCardValue } from './card-format.js';
import { dimText } from './dim.js';
import type { AuthMode } from './prompt-answers.js';
import {
  boldText,
  cyanText,
  greenText,
  highlightText,
  yellowText,
} from './terminal-style.js';

export const CREATE_DEEPCRAWL_DOCS_URL =
  'https://deepcrawl.dev/docs/reference/self-hosting/create-deepcrawl';

type BuildDeploymentSuccessCardInput = {
  projectDir: string;
  workerName?: string;
  workerUrl?: string;
  versionId?: string;
  authMode: AuthMode;
  enableActivityLogs: boolean;
  jwtIssuer?: string;
  jwtAudience?: string;
  jwtSecret?: string;
  jwtSecretWasGenerated?: boolean;
  localJwtSecretFiles?: V0LocalJwtSecretFiles;
  previewMode?: boolean;
};

function buildReadCurl(workerUrl: string, token?: string): string {
  const endpoint = `${workerUrl}/read?url=https://example.com`;

  if (!token) {
    return `curl "${endpoint}"`;
  }

  return `curl -H "Authorization: Bearer ${token}" "${endpoint}"`;
}

function addSection(lines: string[], title: string, values: string[]) {
  if (lines.length > 0) {
    lines.push('');
  }

  lines.push(title);
  lines.push(...values);
}

function buildJwtSection(input: BuildDeploymentSuccessCardInput): string[] {
  const lines = [
    `${greenText('✅')} Use ${boldText('HS256')} to sign your token.`,
  ];

  if (input.jwtIssuer) {
    lines.push(
      `${yellowText('⚠')} issuer must match`,
      ...indentLines(wrapCardValue(input.jwtIssuer)),
    );
  }

  if (input.jwtAudience) {
    lines.push(
      `${yellowText('⚠')} audience must match`,
      ...indentLines(wrapCardValue(input.jwtAudience)),
    );
  }

  if (input.jwtSecretWasGenerated && input.jwtSecret) {
    lines.push('');
    lines.push(
      `${highlightText(' JWT SECRET ')} ${yellowText('⚠ Shown once. Save it now.')}`,
    );
    lines.push(...indentLines(renderSecretBox(input.jwtSecret)));
  }

  if (input.localJwtSecretFiles) {
    lines.push('');
    lines.push(`${boldText('📁 Saved to')}`);
    lines.push(
      ...indentLines(wrapCardValue(input.localJwtSecretFiles.devVarsPath)),
    );
    lines.push(
      ...indentLines(
        wrapCardValue(input.localJwtSecretFiles.productionDevVarsPath),
      ),
    );
  }

  if (!input.jwtSecretWasGenerated && input.localJwtSecretFiles) {
    lines.push('');
    lines.push(`${greenText('✅')} Your JWT secret is saved in both files.`);
  }

  return lines;
}

function buildNoAuthSection(input: BuildDeploymentSuccessCardInput): string[] {
  if (input.previewMode) {
    return [`${greenText('✅')} No auth would be required for a real deploy.`];
  }

  return [`${greenText('✅')} This API is open. You can test it right away.`];
}

function buildPreviewSetupSection(
  input: BuildDeploymentSuccessCardInput & {
    workerName: string;
    workerUrl: string;
  },
): string[] {
  return [
    `${greenText('✅')} Project folder ready`,
    ...indentLines(wrapCardValue(input.projectDir)),
    `${greenText('✅')} Preview worker name`,
    ...indentLines(wrapCardValue(input.workerName)),
    `${greenText('✅')} Preview URL`,
    ...indentLines(wrapCardValue(input.workerUrl).map(cyanText)),
    `${greenText(input.enableActivityLogs ? '✅' : '•')} Activity logs setting: ${
      input.enableActivityLogs ? greenText('On') : dimText('Off')
    }`,
    `${yellowText('⚠')} Not run in preview`,
    ...indentLines(
      wrapCardValue(
        'Cloudflare resources were not created, remote D1 migrations were not applied, and the worker was not deployed.',
      ),
    ),
  ];
}

function buildCreatedSection(
  input: BuildDeploymentSuccessCardInput & {
    workerName: string;
  },
): string[] {
  return [
    `${greenText('✅')} Worker ready`,
    ...indentLines(wrapCardValue(input.workerName)),
    `${greenText('✅')} Cloudflare resources`,
    ...indentLines(wrapCardValue('1 D1 database and 2 KV namespaces')),
    `${greenText('✅')} Remote D1 migrations applied`,
    `${greenText(input.enableActivityLogs ? '✅' : '•')} Activity logs: ${
      input.enableActivityLogs ? greenText('On') : dimText('Off')
    }`,
    `${boldText('📂 Project folder')}`,
    ...indentLines(wrapCardValue(input.projectDir)),
  ];
}

export function buildDeploymentSuccessCard(
  input: BuildDeploymentSuccessCardInput,
): string {
  const workerUrl = input.workerUrl ?? '(Worker URL not found)';
  const workerName = input.workerName ?? 'V0 API Worker';
  const tryItNowToken = input.authMode === 'jwt' ? '<your-jwt>' : undefined;
  const tryItNowCurl =
    input.authMode === 'jwt'
      ? `curl -H "Authorization: Bearer <your-jwt>" "${workerUrl}/read?url=https://example.com"`
      : buildReadCurl(workerUrl);

  const lines: string[] = [];

  if (input.previewMode) {
    addSection(
      lines,
      `${highlightText(' PREVIEW ONLY ')} ${yellowText('🧪 No Cloudflare resources were created.')}`,
      [],
    );
  }

  addSection(
    lines,
    boldText('🌐 API'),
    indentLines(wrapCardValue(workerUrl).map(cyanText)),
  );
  addSection(
    lines,
    boldText('📘 Docs'),
    indentLines(wrapCardValue(CREATE_DEEPCRAWL_DOCS_URL).map(cyanText)),
  );
  addSection(lines, boldText('🧪 Try it now'), [
    dimText('Read a page'),
    ...indentLines(wrapCardValue(tryItNowCurl)),
    '',
    dimText('Extract links'),
    ...indentLines(
      wrapCardValue(
        input.authMode === 'jwt'
          ? `curl -H "Authorization: Bearer ${tryItNowToken}" "${workerUrl}/links?url=https://example.com"`
          : `curl "${workerUrl}/links?url=https://example.com"`,
      ),
    ),
  ]);

  addSection(
    lines,
    boldText(input.authMode === 'jwt' ? '🔐 JWT' : '🟢 No auth'),
    input.authMode === 'jwt'
      ? buildJwtSection(input)
      : buildNoAuthSection(input),
  );
  addSection(
    lines,
    boldText(input.previewMode ? '🧰 Prepared locally' : '✅ Created for you'),
    input.previewMode
      ? buildPreviewSetupSection({
          ...input,
          workerName,
          workerUrl,
        })
      : buildCreatedSection({
          ...input,
          workerName,
        }),
  );

  if (input.versionId) {
    addSection(lines, dimText('🧩 Deployment ID (advanced)'), [
      ...indentLines(wrapCardValue(input.versionId).map(dimText)),
    ]);
  }

  return lines.join('\n');
}
