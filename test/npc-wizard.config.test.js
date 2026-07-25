import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('NpcWizard config wires steps', async () => {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document, console };
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

  // Name
  document.querySelector('input').value = 'Bob';
  wiz.next();

  // Portrait: dynamic list falls back to full asset paths; custom entry allowed
  const portraitSelect = document.querySelector('select');
  const optionValues = portraitSelect.children.map(o => o.value);
  assert.ok(optionValues.includes('assets/portraits/portrait_1000.png'));
  portraitSelect.value = 'assets/portraits/portrait_1000.png';
  wiz.next();

  // Portrait prompt
  document.querySelector('input').value = 'rusted scavenger';
  wiz.next();

  // Dialogue
  document.querySelector('input').value = 'Hello';
  wiz.next();

  // Quest type defaults to fetch
  assert.strictEqual(document.querySelector('select').value, 'fetch');
  wiz.next();

  // Fetch goal: custom item name, count preset to 1
  const inputs = document.querySelectorAll('input');
  inputs[0].value = 'Odd Gear';
  assert.strictEqual(inputs[1].value, '1');
  wiz.next();

  // Reward step: scrap defaults to 10
  assert.strictEqual(document.querySelector('input').value, '10');
  wiz.next();

  // Placement
  wiz.getState().pos = { x: 0, y: 0 };
  wiz.next();

  // Confirm
  wiz.next();

  const state = wiz.getState();
  assert.strictEqual(state.prompt, 'rusted scavenger');
  assert.strictEqual(state.portrait, 'assets/portraits/portrait_1000.png');
  assert.strictEqual(state.questType, 'fetch');
  assert.strictEqual(state.questItemName, 'Odd Gear');
  assert.strictEqual(state.scrapReward, 10);
});
