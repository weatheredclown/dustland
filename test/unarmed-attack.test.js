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

test('unarmed attacks damage undefended foes', () => {
  const enemy = { name: 'Rotwalker', hp: 5, maxHp: 5, DEF: 0 };
  const attacker = makeMember('a', 'A', 'Hero');
  const r = Math.random; Math.random = () => 0;
  __testAttack(attacker, enemy, 1);
  Math.random = r;
  assert.strictEqual(enemy.hp, 4);
});

test('attack logs bounce when defense absorbs it', () => {
  const enemy = { name: 'Armored', hp: 5, maxHp: 5, DEF: 1 };
  const attacker = makeMember('a', 'A', 'Hero');
  const msgs = [];
  global.log = (m) => msgs.push(m);
  const r = Math.random; Math.random = () => 0;
  __testAttack(attacker, enemy, 1);
  Math.random = r;
  assert.strictEqual(enemy.hp, 5);
  assert.ok(msgs.some(m => m.includes('bounces')));
});
