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

test('trainer upgrade flow stays under fifteen seconds', async () => {
  const { context, dom } = setup();
  const m = context.makeMember('id', 'Name', 'Role');
  m.skillPoints = 1;
  context.party.push(m);
  const start = Date.now();
  await context.TrainerUI.showTrainer('power', 0);
  const btn = dom.window.document.querySelector('#trainer_ui button');
  btn.click();
  const end = Date.now();
  assert.ok(end - start < 15000);
});
