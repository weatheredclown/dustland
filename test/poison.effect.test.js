import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

global.log = () => {};
global.toast = () => {};
global.EventBus = { emit: () => {} };

const dom = new JSDOM(`<div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div><div id="turnIndicator"></div>`);
global.document = dom.window.document;
global.window = dom.window;

await import('../scripts/core/party.js');
await import('../scripts/core/combat.js');
await import('../scripts/core/inventory.js');

const { addStatus, tickStatuses, registerItem, addToInv, useItem, equipItem, makeMember, party } = globalThis;

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
