import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

async function loadSteps() {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document, console };
  vm.createContext(context);
  for (const f of ['asset-picker.js', 'item-picker.js']) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  return { context, document, container };
}

test('assetPicker resolves function options at render time', async () => {
  const { context, container } = await loadSteps();
  let calls = 0;
  const step = context.Dustland.WizardSteps.assetPicker('Portrait', () => {
    calls++;
    return ['a.png', 'b.png'];
  }, 'portrait');
  const state = {};
  step.render(container, state);
  assert.strictEqual(calls, 1);
  const select = container.querySelector('select');
  assert.deepStrictEqual(select.children.map(o => o.value), ['', 'a.png', 'b.png']);
  select.value = 'b.png';
  assert.strictEqual(step.validate(), true);
  step.onComplete(state);
  assert.strictEqual(state.portrait, 'b.png');
});

test('assetPicker allowCustom accepts a typed-in value over the list', async () => {
  const { context, container } = await loadSteps();
  const step = context.Dustland.WizardSteps.assetPicker('Portrait', ['a.png'], 'portrait', { allowCustom: true });
  const state = {};
  step.render(container, state);
  const input = container.querySelector('input');
  assert.ok(input);
  input.value = 'assets/portraits/custom.png';
  assert.strictEqual(step.validate(), true);
  step.onComplete(state);
  assert.strictEqual(state.portrait, 'assets/portraits/custom.png');
});

test('assetPicker preserves a previous custom value across re-renders', async () => {
  const { context, container } = await loadSteps();
  const step = context.Dustland.WizardSteps.assetPicker('Portrait', ['a.png'], 'portrait', { allowCustom: true });
  const state = { portrait: 'mine.png' };
  step.render(container, state);
  assert.strictEqual(container.querySelector('input').value, 'mine.png');
});

test('itemPicker resolves function options with id/name pairs', async () => {
  const { context, container } = await loadSteps();
  const step = context.Dustland.WizardSteps.itemPicker('Fetch Item', () => [
    { id: 'chip', name: 'Water Chip' },
    'scrap_rod'
  ], 'questItem');
  const state = {};
  step.render(container, state);
  const select = container.querySelector('select');
  assert.deepStrictEqual(select.children.map(o => o.value), ['', 'chip', 'scrap_rod']);
  assert.strictEqual(select.children[1].textContent, 'Water Chip');
  select.value = 'chip';
  assert.strictEqual(step.validate(), true);
  step.onComplete(state);
  assert.strictEqual(state.questItem, 'chip');
});
