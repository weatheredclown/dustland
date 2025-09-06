import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

// minimal DOM for combat module
const dom = new JSDOM(`<div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div><div id="turnIndicator"></div>`);
global.window = dom.window;
global.document = dom.window.document;

await import('../scripts/core/party.js');
await import('../scripts/core/combat.js');

global.updateHUD = () => {};
global.player = { hp: 10, inv: [] };
global.log = () => {};

test('spread mod hits all enemies with reduced damage', async () => {
  const e1 = { name: 'E1', hp: 5, maxHp: 5, DEF: 0 };
  const e2 = { name: 'E2', hp: 5, maxHp: 5, DEF: 0 };
  party.length = 0;
  const attacker = makeMember('a', 'A', 'Hero');
  attacker.stats.STR = 8;
  attacker.equip.weapon = { mods: { ADR: 10, spread: 50 } };
  party.push(attacker);
  const r = Math.random; Math.random = () => 0;
  const p = openCombat([e1, e2]);
  handleCombatKey({ key: 'Enter' });
  Math.random = r;
  const enemies = __combatState.enemies;
  assert.strictEqual(enemies[0].hp, 4);
  assert.strictEqual(enemies[1].hp, 4);
  closeCombat('flee');
  await p;
});
