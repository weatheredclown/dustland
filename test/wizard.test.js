import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('wizard preserves state and validates steps', async () => {
  const document = makeDocument();
  const containerEl = document.getElementById('w');
  document.body.appendChild(containerEl);
  const context = { window: { document }, document, console };
  vm.createContext(context);
  const busCode = await fs.readFile(new URL('../scripts/event-bus.js', import.meta.url), 'utf8');
  vm.runInContext(busCode, context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const textCode = await fs.readFile(new URL('../components/wizard/steps/text.js', import.meta.url), 'utf8');
  vm.runInContext(textCode, context);
  const confirmCode = await fs.readFile(new URL('../components/wizard/steps/confirm.js', import.meta.url), 'utf8');
  vm.runInContext(confirmCode, context);
  const container = containerEl;
  let finished = false;
  const wizard = context.Dustland.Wizard(container, [
    context.Dustland.WizardSteps.text('Name', 'name'),
    context.Dustland.WizardSteps.confirm('Done')
  ], { onComplete(){ finished = true; } });

  assert.strictEqual(wizard.current(), 0);
  assert.strictEqual(wizard.next(), false);
  document.querySelector('input').value = 'Alice';
  assert.strictEqual(wizard.next(), true);
  assert.strictEqual(wizard.getState().name, 'Alice');
  wizard.prev();
  assert.strictEqual(wizard.current(), 0);
  assert.strictEqual(document.querySelector('input').value, 'Alice');
  wizard.next();
  assert.strictEqual(wizard.current(), 1);
  wizard.next();
  assert.ok(finished);
});

test('asset picker step stores selection', async () => {
  const document = makeDocument();
  const containerEl = document.getElementById('w');
  document.body.appendChild(containerEl);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const assetCode = await fs.readFile(new URL('../components/wizard/steps/asset-picker.js', import.meta.url), 'utf8');
  vm.runInContext(assetCode, context);
  const wizard = context.Dustland.Wizard(containerEl, [
    context.Dustland.WizardSteps.assetPicker('Portrait', ['a.png', 'b.png'], 'portrait')
  ], {});
  document.querySelector('select').value = 'b.png';
  wizard.next();
  assert.strictEqual(wizard.getState().portrait, 'b.png');
});
