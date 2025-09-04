import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('ChestWizard config wires steps', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepFiles = ['text.js', 'map-placement.js', 'confirm.js'];
  for (const f of stepFiles) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  const chestCode = await fs.readFile(new URL('../components/wizard/chest-wizard.js', import.meta.url), 'utf8');
  vm.runInContext(chestCode, context);
  const cfg = context.Dustland.ChestWizard;
  assert.ok(cfg && cfg.steps && cfg.steps.length);
  assert.strictEqual(context.Dustland.wizards.chest, cfg);
  const wiz = context.Dustland.Wizard(container, cfg.steps);
  document.querySelector('input').value = 'Chest';
  wiz.next();
  document.querySelector('input').value = 'Key';
  wiz.next();
  document.querySelector('input').value = 'Loot';
  wiz.next();
  wiz.getState().chestPos = { x: 0, y: 0 };
  wiz.next();
  wiz.getState().keyPos = { x: 1, y: 1 };
  wiz.next();
  wiz.next();
  assert.strictEqual(wiz.getState().lootName, 'Loot');
});
