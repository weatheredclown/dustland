import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const trainerUiCode = await fs.readFile(new URL('../scripts/trainer-ui.js', import.meta.url), 'utf8');
const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
const dataCode = await fs.readFile(new URL('../data/skills/trainer-upgrades.js', import.meta.url), 'utf8');

function setup(){
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.com' });
  const context = {
    ...dom.window,
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: { emit: () => {} }
  };
  context.localStorage = dom.window.localStorage;
  vm.createContext(context);
  vm.runInContext(dataCode, context);
  vm.runInContext(partyCode, context);
  vm.runInContext(trainerUiCode, context);
  return { context, dom };
}

test('render trainer options', async () => {
  const { context, dom } = setup();
  await context.TrainerUI.showTrainer('power');
  const buttons = dom.window.document.querySelectorAll('#trainer_ui button');
  assert.strictEqual(buttons.length, 2);
  assert.ok(buttons[0].textContent.includes('STR'));
});

test('apply upgrade via click', async () => {
  const { context, dom } = setup();
  const m = context.makeMember('id', 'Name', 'Role');
  m.skillPoints = 1;
  context.party.push(m);
  await context.TrainerUI.showTrainer('power');
  const btn = dom.window.document.querySelector('#trainer_ui button');
  btn.click();
  assert.strictEqual(m.stats.STR, 5);
  assert.strictEqual(m.skillPoints, 0);
});

test('trainer ui is fixed on screen', async () => {
  const { context, dom } = setup();
  const box = await context.TrainerUI.showTrainer('power');
  assert.strictEqual(box.style.position, 'fixed');
  assert.ok(parseInt(box.style.bottom) > 0);
});
