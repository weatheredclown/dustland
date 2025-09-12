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
  const bus = { emit: () => {} };
  const context = {
    ...dom.window,
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: bus,
    Dustland: { eventBus: bus },
    player: {},
    party: [],
    state: {}
  };
  vm.createContext(context);
  vm.runInContext(dataCode, context);
  vm.runInContext(partyCode, context);
  vm.runInContext(trainerUiCode, context);
  const npc = { id: 'npc', tree: { train: { text: '', choices: [] } } };
  context.currentNPC = npc;
  return { context, npc };
}

test('trainer upgrade flow stays under fifteen seconds', () => {
  const { context, npc } = setup();
  const m = context.makeMember('id', 'Name', 'Role');
  const lead = context.makeMember('lead', 'Lead', 'Role');
  lead.skillPoints = 1;
  m.skillPoints = 1;
  context.party.push(lead); context.party.push(m);
  const start = Date.now();
  context.TrainerUI.showTrainer('power', 1);
  npc.tree.train.choices[0].effects[0]();
  const end = Date.now();
  assert.ok(end - start < 15000);
});
