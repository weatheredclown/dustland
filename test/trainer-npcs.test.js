import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');

function setupParty(){
  const context = {
    log: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    EventBus: { emit: () => {} }
  };
  vm.createContext(context);
  vm.runInContext(partyCode, context);
  return context;
}

test('trainStat spends a point and raises stat', () => {
  const ctx = setupParty();
  const m = ctx.makeMember('id', 'Name', 'Role');
  m.skillPoints = 1;
  ctx.party.push(m);
  assert.strictEqual(ctx.trainStat('STR'), true);
  assert.strictEqual(m.stats.STR, 5);
  assert.strictEqual(m.skillPoints, 0);
});

const moduleCode = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');

test('dustland module includes trainer NPCs', () => {
  const trainerIds = moduleCode.match(/id: 'trainer_[^']+'/g) || [];
  assert.ok(trainerIds.length >= 3);
  const upgradeOpts = moduleCode.match(/\(Upgrade Skills\)/g) || [];
  assert.ok(upgradeOpts.length >= 3);
});
