import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`
  <div id="combatOverlay"></div>
  <div id="combatEnemies"></div>
  <div id="combatParty"></div>
  <div id="combatCmd"></div>
  <div id="turnIndicator"></div>
`);

global.window = dom.window;
global.document = dom.window.document;
global.EventBus = { emit() {} };
global.log = () => {};
global.toast = () => {};
global.updateHUD = () => {};

global.player = { hp: 10, inv: [], scrap: 0 };

await import('../scripts/core/party.js');
await import('../scripts/core/combat.js');
await import('../scripts/core/inventory.js');

test('grenade consumable damages every enemy', async () => {
  player.inv.length = 0;
  player.scrap = 0;
  party.length = 0;
  const thrower = makeMember('hero', 'Hero', 'Scout');
  thrower.stats.STR = 6;
  party.push(thrower);
  selectedMember = 0;

  addToInv({
    id: 'test_grenade',
    name: 'Test Grenade',
    type: 'consumable',
    use: { type: 'grenade', amount: 5 },
    scrap: 300,
    value: 300
  });

  const enemies = [
    { name: 'Ghoul', hp: 8, maxHp: 8, DEF: 1 },
    { name: 'Bandit', hp: 7, maxHp: 7, DEF: 0 }
  ];

  const ready = openCombat(enemies);
  const used = useItem(0);
  assert.strictEqual(used, true);
  const stateEnemies = __combatState.enemies;
  assert.strictEqual(stateEnemies[0].hp, 4);
  assert.strictEqual(stateEnemies[1].hp, 2);
  assert.strictEqual(player.inv.length, 0);

  closeCombat('flee');
  await ready;
});

test('grenade that overkills clears the encounter', async () => {
  player.inv.length = 0;
  party.length = 0;
  const thrower = makeMember('hero2', 'Heroine', 'Scout');
  party.push(thrower);
  selectedMember = 0;

  addToInv({
    id: 'wipe_grenade',
    name: 'Wipe Grenade',
    type: 'consumable',
    use: { type: 'grenade', amount: 12 },
    scrap: 300,
    value: 300
  });

  const enemies = [
    { name: 'A', hp: 4, maxHp: 4, DEF: 0 },
    { name: 'B', hp: 3, maxHp: 3, DEF: 0 }
  ];

  const ready = openCombat(enemies);
  const used = useItem(0);
  assert.strictEqual(used, true);
  assert.strictEqual(__combatState.enemies.length, 0);
  assert.strictEqual(document.getElementById('combatOverlay').classList.contains('shown'), false);

  await ready;
});
