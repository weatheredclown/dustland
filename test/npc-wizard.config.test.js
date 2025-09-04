import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('NpcWizard config wires steps', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepFiles = ['text.js', 'asset-picker.js', 'map-placement.js', 'confirm.js', 'item-picker.js'];
  for (const f of stepFiles) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  const npcCode = await fs.readFile(new URL('../components/wizard/npc-wizard.js', import.meta.url), 'utf8');
  vm.runInContext(npcCode, context);
  const cfg = context.Dustland.NpcWizard;
  assert.ok(cfg && cfg.steps && cfg.steps.length);
  assert.strictEqual(context.Dustland.wizards.npc, cfg);
  const wiz = context.Dustland.Wizard(container, cfg.steps);
  document.querySelector('input').value = 'Bob';
  wiz.next();
  document.querySelector('select').value = 'portrait_1000.png';
  wiz.next();
  document.querySelector('input').value = 'Hello';
  wiz.next();
  document.querySelector('select').value = 'tuned_crystal';
  wiz.next();
  wiz.getState().pos = { x: 0, y: 0 };
  wiz.next();
  wiz.next();
  assert.strictEqual(wiz.getState().questItem, 'tuned_crystal');
});
