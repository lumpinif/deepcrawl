import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildDeploymentSummary,
  normalizeProjectName,
  resolveProjectLocation,
  resolveProjectLocationFromTargetPath,
} from '../ui/prompt-answers.js';

test('normalizeProjectName converts input to kebab-case', () => {
  assert.equal(normalizeProjectName('  My Demo Project  '), 'my-demo-project');
});

test('normalizeProjectName rejects empty names', () => {
  assert.throws(() => normalizeProjectName('   '), /Project name is required/);
});

test('resolveProjectLocation builds the target directory from the parent directory', () => {
  assert.deepEqual(
    resolveProjectLocation({
      cwd: '/Users/felix/Desktop/felix-projects/deepcrawl',
      projectName: 'demo-app',
      parentDirectory: '..',
    }),
    {
      projectName: 'demo-app',
      parentDirectory: '..',
      targetDirectory: '/Users/felix/Desktop/felix-projects/demo-app',
    },
  );
});

test('resolveProjectLocationFromTargetPath derives name and parent directory', () => {
  assert.deepEqual(
    resolveProjectLocationFromTargetPath({
      cwd: '/Users/felix/Desktop/felix-projects/deepcrawl',
      targetPath: '../test-create-deepcrawl',
    }),
    {
      projectName: 'test-create-deepcrawl',
      parentDirectory: '..',
      requestedProjectName: 'test-create-deepcrawl',
      requestedTargetPath: '../test-create-deepcrawl',
      targetDirectory:
        '/Users/felix/Desktop/felix-projects/test-create-deepcrawl',
    },
  );
});

test('buildDeploymentSummary matches the deployment recap format', () => {
  assert.equal(
    buildDeploymentSummary({
      answers: {
        deploymentTarget: 'v0-api-worker',
        projectName: 'demo-app',
        parentDirectory: '/tmp',
        targetDirectory: '/tmp/demo-app',
        authMode: 'none',
        enableActivityLogs: true,
      },
    }),
    [
      '- Folder name: demo-app',
      '- Create in: /tmp',
      '- Full path: /tmp/demo-app',
      '- Deploy: V0 API Worker only',
      '- Auth: none',
      '- Activity logs: on',
      '- Cloudflare resources:',
      '  - D1: DEMO_APP_API_DB',
      '  - KV (links): DEMO_APP_API_LINK_STORE',
      '  - KV (read): DEMO_APP_API_READ_STORE',
    ].join('\n'),
  );
});

test('buildDeploymentSummary explains target paths passed from the command line', () => {
  assert.equal(
    buildDeploymentSummary({
      answers: {
        deploymentTarget: 'v0-api-worker',
        projectName: 'my-demo-project',
        parentDirectory: '..',
        targetDirectory: '/Users/felix/Desktop/felix-projects/my-demo-project',
        authMode: 'jwt',
        enableActivityLogs: false,
      },
      requestedProjectName: 'My Demo Project',
      requestedTargetPath: '../My Demo Project',
    }),
    [
      '- Path from command: ../My Demo Project',
      '- Folder name: my-demo-project (from "My Demo Project")',
      '- Create in: ..',
      '- Full path: /Users/felix/Desktop/felix-projects/my-demo-project',
      '- Deploy: V0 API Worker only',
      '- Auth: jwt',
      '- Activity logs: off',
      '- Cloudflare resources:',
      '  - D1: MY_DEMO_PROJECT_API_DB',
      '  - KV (links): MY_DEMO_PROJECT_API_LINK_STORE',
      '  - KV (read): MY_DEMO_PROJECT_API_READ_STORE',
    ].join('\n'),
  );
});
