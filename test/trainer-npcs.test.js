import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');

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
  const trainerNpcs = moduleData.npcs.filter(n => n.id && n.id.startsWith('trainer_'));
  assert.ok(trainerNpcs.length >= 3);
  const upgradeOpts = trainerNpcs.flatMap(n => n.tree?.start?.choices || []).filter(c => c.label && c.label.includes('Upgrade Skills'));
  assert.ok(upgradeOpts.length >= 3);
});
