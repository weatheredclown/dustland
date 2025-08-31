import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/dialog-validator.js';

test('detects missing to targets', () => {
  const tree = { start: { choices: [{ label: 'Go', to: 'end' }] } };
  const errors = Dustland.validateDialogTree(tree);
  assert.deepStrictEqual(errors, ["Missing target 'end' from 'start'"]);
});
