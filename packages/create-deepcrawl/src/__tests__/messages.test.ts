import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCancelMessage } from '../ui/messages.js';

test('getCancelMessage explains that nothing was created', () => {
  assert.equal(
    getCancelMessage(),
    ['Deepcrawl setup cancelled.', 'No folder or project was created.'].join(
      '\n',
    ),
  );
});
