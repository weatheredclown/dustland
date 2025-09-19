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

test('mobile A advances character creator', async () => {
  let interacted = false;
  let nextCalls = 0;
  const { context, document } = await setup({
    interact: () => { interacted = true; }
  });
  const creator = document.getElementById('creator');
  creator.style.display = 'flex';
  const nextBtn = document.getElementById('ccNext');
  nextBtn.disabled = false;
  nextBtn.onclick = () => { nextCalls += 1; };
  const { A: a } = context.setMobileControls(true);
  a.onclick();
  assert.strictEqual(nextCalls, 1);
  assert.ok(!interacted);
});

test('mobile B goes back in character creator', async () => {
  let backCalls = 0;
  const { context, document } = await setup();
  const creator = document.getElementById('creator');
  creator.style.display = 'flex';
  const backBtn = document.getElementById('ccBack');
  backBtn.disabled = false;
  backBtn.onclick = () => { backCalls += 1; };
  const { B: b } = context.setMobileControls(true);
  b.onclick();
  assert.strictEqual(backCalls, 1);
});
