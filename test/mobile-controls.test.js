import assert from 'node:assert';
import { test } from 'node:test';
import { createGameProxy } from './test-harness.js';

async function setup(extras={}){
  const { context, document } = createGameProxy([]);
  Object.assign(context, extras);
  return { context, document };
}

test('mobile buttons are non-selectable and glow on press', async () => {
  const { context, document } = await setup();
  context.setMobileControls(true);
  const btn = document.querySelector('button');
  assert.ok(btn);
  assert.ok(btn.style.cssText?.includes('user-select:none'));
  btn.onpointerdown();
  assert.strictEqual(btn.style.boxShadow, '0 0 8px #0f0');
  btn.onpointerup();
  assert.strictEqual(btn.style.boxShadow, 'none');
});

test('mobile arrows navigate dialog when overlay shown', async () => {
  const keys=[];
  const { context, document } = await setup({
    handleDialogKey: e => { keys.push(e.key); return true; },
    move: () => { keys.push('move'); },
    overlay: null
  });
  document.getElementById('overlay').classList.add('shown');
  context.overlay = document.getElementById('overlay');
  context.setMobileControls(true);
  const up = [...document.querySelectorAll('button')].find(b => b.textContent === '↑');
  up.onclick();
  const down = [...document.querySelectorAll('button')].find(b => b.textContent === '↓');
  down.onclick();
  assert.deepStrictEqual(keys, ['ArrowUp', 'ArrowDown']);
});

test('mobile arrows navigate combat menu when in combat', async () => {
  const keys=[];
  const { context, document } = await setup({
    handleCombatKey: e => { keys.push(e.key); return true; },
    move: () => { keys.push('move'); },
    overlay: null
  });
  document.getElementById('combatOverlay').classList.add('shown');
  context.setMobileControls(true);
  const up = [...document.querySelectorAll('button')].find(b => b.textContent === '↑');
  up.onclick();
  const down = [...document.querySelectorAll('button')].find(b => b.textContent === '↓');
  down.onclick();
  assert.deepStrictEqual(keys, ['ArrowUp', 'ArrowDown']);
});

test('mobile A selects combat option when in combat', async () => {
  const keys = [];
  const { context, document } = await setup({
    handleCombatKey: e => { keys.push(e.key); return true; },
    interact: () => { keys.push('interact'); },
    overlay: null
  });
  document.getElementById('combatOverlay').classList.add('shown');
  context.setMobileControls(true);
  const a = [...document.querySelectorAll('button')].find(b => b.textContent === 'A');
  a.onclick();
  assert.deepStrictEqual(keys, ['Enter']);
});
