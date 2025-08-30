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
  const { up: btn } = context.setMobileControls(true);
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
  const { up, down } = context.setMobileControls(true);
  up.onclick();
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
  const { up, down } = context.setMobileControls(true);
  up.onclick();
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
  const { A: a } = context.setMobileControls(true);
  a.onclick();
  assert.deepStrictEqual(keys, ['Enter']);
});

test('mobile B closes dialog when overlay shown', async () => {
  let closed = false;
  const { context, document } = await setup({
    closeDialog: () => { closed = true; },
    overlay: null
  });
  document.getElementById('overlay').classList.add('shown');
  context.overlay = document.getElementById('overlay');
  const { B: b } = context.setMobileControls(true);
  b.onclick();
  assert.ok(closed);
});

test('mobile B flees combat', async () => {
  const keys = [];
  const { context, document } = await setup({
    handleCombatKey: e => { keys.push(e.key); return true; },
    overlay: null
  });
  document.getElementById('combatOverlay').classList.add('shown');
  const { B: b } = context.setMobileControls(true);
  b.onclick();
  assert.deepStrictEqual(keys, ['Escape']);
});
