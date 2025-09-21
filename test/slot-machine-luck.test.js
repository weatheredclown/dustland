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
  const origRng = globalThis.rng;
  globalThis.rng = () => 0;
  globalThis.applyModule = () => ({ start: {} });
  vm.runInThisContext(code, { filename: 'dustland.module.js' });
  const behaviors = await fs.readFile(new URL('../scripts/core/module-behaviors.js', import.meta.url), 'utf8');
  vm.runInThisContext(behaviors, { filename: 'module-behaviors.js' });
  const effects = await fs.readFile(new URL('../scripts/core/effects.js', import.meta.url), 'utf8');
  vm.runInThisContext(effects, { filename: 'effects.js' });
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.actions = globalThis.Dustland.actions || {};
  globalThis.Dustland.workbench = globalThis.Dustland.workbench || {};
  globalThis.Dustland.fastTravel = globalThis.Dustland.fastTravel || {};
  globalThis.Dustland.worldMap = globalThis.Dustland.worldMap || {};
  globalThis.Dustland.eventBus = globalThis.Dustland.eventBus || { on() {}, off() {}, emit() {} };
  globalThis.soundSources = [];
  globalThis.state = { map: 'slot_shack' };
  globalThis.itemDrops = [];
  globalThis.NPCS = [{ id: 'slots', map: 'slot_shack', x: 3, y: 2 }];
  globalThis.removeNPC = () => {};
  globalThis.Dustland.behaviors.setup(globalThis.DUSTLAND_MODULE);
  const slotNpc = globalThis.DUSTLAND_MODULE.npcs.find(n => n.id === 'slots');
  globalThis.party = [{ stats: { LCK: 7 }, _bonus: { LCK: 0 }, name: 'Hero' }];
  globalThis.leader = () => party[0];

  const play = slotNpc.tree.start.choices[0].effects[0];
  globalThis.Dustland.effects.apply([play]);
  assert.equal(player.scrap, 4);

  player.scrap = 5;
  party[0].stats.LCK = 8;
  logMessages.length = 0;
  globalThis.Dustland.effects.apply([play]);
  assert.equal(player.scrap, 5);
  assert.ok(logMessages.some(m => m.includes('Lucky spin')));

  globalThis.rng = origRng;
});
