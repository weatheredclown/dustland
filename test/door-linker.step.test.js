import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('doorLinker step records entry and exit', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepCode = await fs.readFile(new URL('../components/wizard/steps/door-linker.js', import.meta.url), 'utf8');
  vm.runInContext(stepCode, context);
  const wizard = context.Dustland.Wizard(container, [
    context.Dustland.WizardSteps.doorLinker('entry', 'exit')
  ], {});
  const canvases = container.querySelectorAll('canvas');
  canvases[0].getBoundingClientRect = () => ({ left: 0, top: 0 });
  canvases[1].getBoundingClientRect = () => ({ left: 0, top: 0 });
  canvases[0].dispatchEvent({ type: 'click', clientX: 10, clientY: 20 });
  canvases[1].dispatchEvent({ type: 'click', clientX: 30, clientY: 40 });
  const state = JSON.parse(JSON.stringify(wizard.getState()));
  assert.deepStrictEqual(state.entry, { x: 1, y: 2 });
  assert.deepStrictEqual(state.exit, { x: 3, y: 4 });
  assert.ok(wizard.next());
});
