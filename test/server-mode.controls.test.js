import assert from 'node:assert/strict';
import { test } from 'node:test';

import { describeSnapshot } from '../scripts/ack/server-mode-controls.js';

test('describeSnapshot surfaces bootstrap disable reason', () => {
  const snapshot = {
    status: 'disabled',
    user: null,
    error: null,
    bootstrap: { status: 'disabled', reason: 'missing-config', features: {} },
  };

  const ui = describeSnapshot(snapshot);

  assert.equal(ui.buttonLabel, '☁ Cloud');
  assert.equal(ui.buttonDisabled, true);
  assert.match(ui.message, /firebase settings/i);
  assert.match(ui.buttonTooltip, /firebase/i);
});
