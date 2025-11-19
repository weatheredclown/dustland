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

test('render trainer options with stat deltas', () => {
  const { context, npc } = setup();
  const m = context.makeMember('id', 'Name', 'Role');
  context.party.push(m);
  context.TrainerUI.showTrainer('power', 0);
  const choices = npc.tree.train.choices;
  assert.strictEqual(choices.length, 3);
  assert.ok(choices[0].label.includes('4→5'));
});

test('uses npc tree when dialog state lacks train node', () => {
  const { context, npc } = setup();
  context.dialogState = { tree: {} };
  const m = context.makeMember('id', 'Name', 'Role');
  context.party.push(m);
  const ok = context.TrainerUI.showTrainer('power', 0);
  assert.strictEqual(ok, true);
  assert.strictEqual(npc.tree.train.choices.length, 3);
  assert.strictEqual(context.dialogState.tree.train.choices.length, 3);
  assert.strictEqual(context.dialogState.tree.train.next.length, 3);
});

test('apply upgrade via effect', () => {
  const { context, npc } = setup();
  const lead = context.makeMember('lead', 'Lead', 'Role');
  lead.skillPoints = 1;
  const m = context.makeMember('id', 'Name', 'Role');
  m.skillPoints = 1;
  context.party.push(lead); context.party.push(m);
  context.TrainerUI.showTrainer('power', 1);
  npc.tree.train.choices[0].effects[0]();
  assert.strictEqual(lead.stats.STR, 5);
  assert.strictEqual(lead.skillPoints, 0);
  assert.strictEqual(m.skillPoints, 1);
});

test('shows leader skill points in text', () => {
  const { context, npc } = setup();
  const lead = context.makeMember('lead', 'Lead', 'Role');
  lead.skillPoints = 2;
  context.party.push(lead);
  context.TrainerUI.showTrainer('power', 0);
  assert.ok(npc.tree.train.text.includes('Skill Points: 2'));
  assert.ok(npc.tree.train.text.includes('training: Lead'));
});
