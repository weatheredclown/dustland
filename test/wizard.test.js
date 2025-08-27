import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

test('wizard preserves state and validates steps', async () => {
  const dom = new JSDOM('<div id="w"></div>');
  const context = { window: dom.window, document: dom.window.document, console };
  vm.createContext(context);
  const busCode = await fs.readFile(new URL('../event-bus.js', import.meta.url), 'utf8');
  vm.runInContext(busCode, context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const textCode = await fs.readFile(new URL('../components/wizard/steps/text.js', import.meta.url), 'utf8');
  vm.runInContext(textCode, context);
  const confirmCode = await fs.readFile(new URL('../components/wizard/steps/confirm.js', import.meta.url), 'utf8');
  vm.runInContext(confirmCode, context);
  const container = dom.window.document.getElementById('w');
  let finished = false;
  const wizard = context.Dustland.Wizard(container, [
    context.Dustland.WizardSteps.text('Name', 'name'),
    context.Dustland.WizardSteps.confirm('Done')
  ], { onComplete(){ finished = true; } });

  assert.strictEqual(wizard.current(), 0);
  assert.strictEqual(wizard.next(), false);
  dom.window.document.querySelector('input').value = 'Alice';
  assert.strictEqual(wizard.next(), true);
  assert.strictEqual(wizard.getState().name, 'Alice');
  wizard.prev();
  assert.strictEqual(wizard.current(), 0);
  assert.strictEqual(dom.window.document.querySelector('input').value, 'Alice');
  wizard.next();
  assert.strictEqual(wizard.current(), 1);
  wizard.next();
  assert.ok(finished);
});
