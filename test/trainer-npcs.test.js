import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
const npcCode = await fs.readFile(new URL('../scripts/core/npc.js', import.meta.url), 'utf8');

function setupParty(){
  const bus = { emit: () => {} };
  const context = {
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: bus,
    Dustland: { eventBus: bus }
  };
  vm.createContext(context);
  vm.runInContext(partyCode, context);
  return context;
}

function buildNpc(def){
  const calls = [];
  const context = { log: () => {}, Dustland: {}, closeDialog: () => {}, TrainerUI: { showTrainer: id => calls.push(id) } };
  vm.createContext(context);
  vm.runInContext(npcCode, context);
  const npc = context.makeNPC(def.id, def.map || 'world', def.x || 0, def.y || 0, def.color, def.name || def.id, def.title || '', def.desc || '', def.tree, null, null, null, { trainer: def.trainer });
  return { npc, calls };
}

const moduleSrc = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
const MARKER = 'const DATA = `';
const start = moduleSrc.indexOf(MARKER);
const end = moduleSrc.indexOf('`', start + MARKER.length);
const moduleData = JSON.parse(moduleSrc.slice(start + MARKER.length, end));

test('trainStat spends a point and raises stat', () => {
  const ctx = setupParty();
  const m = ctx.makeMember('id', 'Name', 'Role');
  m.skillPoints = 1;
  ctx.party.push(m);
  assert.strictEqual(ctx.trainStat('STR'), true);
  assert.strictEqual(m.stats.STR, 5);
  assert.strictEqual(m.skillPoints, 0);
});

test('dustland module includes trainer NPCs', () => {
  const trainerNpcs = moduleData.npcs.filter(n => n.trainer);
  assert.ok(trainerNpcs.length >= 3);
  trainerNpcs.forEach(def => {
    const { npc, calls } = buildNpc(def);
    const labels = npc.tree.start.choices.map(c => c.label);
    assert.ok(labels.includes('(Upgrade Skills)'));
    const choice = npc.tree.start.choices.find(c => c.to === 'train');
    choice.effects[0]();
    assert.deepStrictEqual(calls, [def.trainer]);
  });
});
