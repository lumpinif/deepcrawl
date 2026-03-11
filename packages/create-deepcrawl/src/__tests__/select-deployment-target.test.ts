import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDeploymentTargetOptions } from '../ui/select-deployment-target.js';

test('getDeploymentTargetOptions keeps soon items visible but disabled', () => {
  assert.deepEqual(getDeploymentTargetOptions(), [
    {
      value: 'v0-api-worker',
      label: 'V0 API Worker only',
      hint: 'Available now',
    },
    {
      value: 'dashboard-api',
      label: 'Dashboard app + API',
      hint: 'Supporting soon',
      disabled: true,
    },
    {
      value: 'fullstack',
      label: 'Fullstack app + auth + API',
      hint: 'Supporting soon',
      disabled: true,
    },
    {
      value: 'custom-domains',
      label: 'Custom domains and routes',
      hint: 'Supporting soon',
      disabled: true,
    },
  ]);
});
