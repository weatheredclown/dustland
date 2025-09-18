import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

global.log = () => {};
global.toast = () => {};
const busListeners = {};
global.EventBus = {
  emit: (evt, payload) => {
    (busListeners[evt] || []).forEach(fn => fn(payload));
  },
  on: (evt, fn) => {
    (busListeners[evt] = busListeners[evt] || []).push(fn);
  }
};
global.Dustland = {
  eventBus: global.EventBus,
  effects: { tick: () => {} },
  actions: { startCombat: () => {} },
  path: { tickPathAI: () => {} }
};
global.TILE = { ROAD: 0 };
global.walkable = { 0: true };
global.world = [ [0,0], [0,0] ];
global.itemDrops = [];
global.NPCS = [];
global.interiors = {};
global.tileEvents = [];
global.enemyBanks = { world: [] };
global.WORLD_W = 10;
global.WORLD_H = 10;
global.state = { map: 'world' };
global.player = { hp: 10, scrap: 0 };
global.clamp = (v, min, max) => Math.max(min, Math.min(max, v));
global.setPartyPos = (x, y) => {
  if(global.party){
    global.party.x = x;
    global.party.y = y;
  }
};
global.footstepBump = () => {};
global.checkAggro = () => {};
global.checkRandomEncounter = () => {};
global.updateHUD = () => {};
global.centerCamera = () => {};
global.updateZoneMsgs = () => {};
global.applyZones = () => {};
global.renderParty = () => {};

const dom = new JSDOM(`<div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div><div id="turnIndicator"></div>`);
global.document = dom.window.document;
global.window = dom.window;

await import('../scripts/core/party.js');
await import('../scripts/core/combat.js');
await import('../scripts/core/inventory.js');
await import('../scripts/core/movement.js');

const { addStatus, tickStatuses, registerItem, addToInv, useItem, equipItem, makeMember, party, move } = globalThis;

test('poison deals damage over time', () => {
  const foe = { name: 'Foe', hp: 10, maxHp: 10 };
  addStatus(foe, { type: 'poison', strength: 2, duration: 3 });
  tickStatuses(foe);
  assert.strictEqual(foe.hp, 8);
  tickStatuses(foe);
  assert.strictEqual(foe.hp, 6);
  tickStatuses(foe);
  assert.strictEqual(foe.hp, 4);
  assert.strictEqual(foe.statusEffects.length, 0);
});

test('reapplying poison extends duration instead of stacking', () => {
  const foe = { name: 'Stacked', hp: 12, maxHp: 12 };
  addStatus(foe, { type: 'poison', strength: 1, duration: 2 });
  addStatus(foe, { type: 'poison', strength: 3, duration: 4 });
  assert.strictEqual(foe.statusEffects.length, 1);
  assert.strictEqual(foe.statusEffects[0].strength, 3);
  assert.strictEqual(foe.statusEffects[0].remaining, 6);
});

test('cleanse item clears poison', () => {
  party.length = 0;
  globalThis.player = { inv: [] };
  const m1 = makeMember('p1', 'P1', 'Role');
  party.push(m1);
  addStatus(m1, { type: 'poison', strength: 1, duration: 5 });
  registerItem({ id: 'antidote', name: 'Antidote', type: 'misc', use: { type: 'cleanse' } });
  addToInv('antidote');
  assert.ok(m1.statusEffects.length > 0);
  useItem(0);
  assert.strictEqual(m1.statusEffects.length, 0);
});

test('poison immunity prevents poison application', () => {
  party.length = 0;
  globalThis.player = { inv: [] };
  const hero = makeMember('p2', 'P2', 'Role');
  party.push(hero);
  registerItem({ id: 'test_poison_plate', name: 'Test Plate', type: 'armor', mods: { poison_immune: 1 } });
  addToInv('test_poison_plate');
  equipItem(0, 0);
  addStatus(hero, { type: 'poison', strength: 2, duration: 4 });
  assert.strictEqual(hero.statusEffects.length, 0);
});

test('walking ticks poison damage outside combat', async () => {
  party.length = 0;
  party.x = 0;
  party.y = 0;
  globalThis.player = { inv: [], hp: 10, scrap: 0 };
  globalThis.checkRandomEncounter = () => {};
  const hero = makeMember('walker', 'Walker', 'Role');
  hero.maxHp = 10;
  hero.hp = 10;
  party.push(hero);
  addStatus(hero, { type: 'poison', strength: 2, duration: 2 });
  await move(1, 0);
  assert.strictEqual(hero.hp, 8);
  assert.strictEqual(hero.statusEffects[0].remaining, 1);
});
