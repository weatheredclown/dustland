import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('combat announces encountered enemies', async () => {
  const { context, document } = createGameProxy([{ name: 'Hero', hp: 5 }]);
  context.party.restore = () => {};
  context.toggleAudio();
  const combatCode = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');
  vm.runInContext(combatCode, context);
  const p = context.openCombat([{ name: 'Slime', hp: 1 }]);
  const log = document.getElementById('log');
  assert.strictEqual(log.children[0].textContent, 'You encounter a Slime.');
  context.closeCombat('win');
  await p;
});
