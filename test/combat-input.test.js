import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('combat ignores held arrow key on start', async () => {
  const { context, document } = createGameProxy([{ name: 'Hero', hp: 5 }]);
  const combatCode = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');
  vm.runInContext(combatCode, context);
  context.openCombat([{ name: 'Slime', hp: 1 }]);
  const menu = document.getElementById('combatCmd');
  context.handleCombatKey({ key: 'ArrowDown', repeat: true });
  assert.ok(menu.children[0].classList.contains('sel'));
  context.window.dispatchEvent(new context.window.KeyboardEvent('keyup', { key: 'ArrowDown' }));
  context.handleCombatKey({ key: 'ArrowDown' });
  assert.ok(menu.children[3].classList.contains('sel'));
});
