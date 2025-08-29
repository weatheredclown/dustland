import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('leader luck above 7 boosts slot machine payout', async () => {
  const code = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  globalThis.WORLD_H = 10;
  globalThis.WORLD_W = 10;
  globalThis.TILE = { WALL: 1, FLOOR: 0, DOOR: 2 };
  globalThis.player = { scrap: 5 };
  globalThis.DC = { TALK: 10, REPAIR: 10 };
  globalThis.CURRENCY = 'scrap';
  globalThis.logMessages = [];
  globalThis.log = (m) => logMessages.push(m);
  globalThis.updateHUD = () => {};
  globalThis.addToInv = () => {};
  globalThis.rng = () => 0;
  globalThis.applyModule = () => ({ start: {} });
  const mod = vm.runInThisContext(code + '\nDUSTLAND_MODULE', { filename: 'dustland.module.js' });

  const slotNpc = mod.npcs.find(n => n.id === 'slots');
  globalThis.party = [{ stats: { LCK: 7 }, _bonus: { LCK: 0 }, name: 'Hero' }];
  globalThis.leader = () => party[0];
  const origRandom = Math.random;
  Math.random = () => 0;

  // Luck at 7 does not influence outcome
  slotNpc.tree.start.choices[0].effects[0]();
  assert.equal(player.scrap, 4);

  // Luck above 7 can improve the result
  player.scrap = 5;
  party[0].stats.LCK = 8;
  logMessages.length = 0;
  slotNpc.tree.start.choices[0].effects[0]();
  assert.equal(player.scrap, 5);
  assert.ok(logMessages.some(m => m.includes('Lucky spin')));

  Math.random = origRandom;
});

