import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('tilemap picker step stores selection', async () => {
  const document = makeDocument();
  const containerEl = document.getElementById('w');
  document.body.appendChild(containerEl);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const tileCode = await fs.readFile(new URL('../components/wizard/steps/tilemap-picker.js', import.meta.url), 'utf8');
  vm.runInContext(tileCode, context);
  const wizard = context.Dustland.Wizard(containerEl, [
    context.Dustland.WizardSteps.tilemapPicker('Tilemap', ['a.tmx', 'b.tmx'], 'map')
  ], {});
  document.querySelector('select').value = 'b.tmx';
  wizard.next();
  assert.strictEqual(wizard.getState().map, 'b.tmx');
});
