import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('persona STR mod increases attack damage', async () => {
  const { context } = createGameProxy([]);
  context.updateHUD = () => {};
  context.renderParty = () => {};
  context.log = () => {};
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const partyJs = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyJs, context);
  const combatJs = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');
  vm.runInContext(combatJs, context);

  const hero = context.makeMember('h', 'Hero', '', {});
  context.joinParty(hero);
  context.Dustland.gameState.updateState(s => { s.party = context.party; });
  hero.applyEquipmentStats();

  const enemy = { name: 'Dummy', hp: 10, maxHp: 10, ATK: 1, _bonus: {}, stats: {} };

  context.__testAttack(hero, enemy, 1);
  const baseHp = enemy.hp;

  enemy.hp = 10;
  context.Dustland.gameState.setPersona('p1', { mods: { STR: 2 } });
  context.Dustland.gameState.applyPersona('h', 'p1');
  context.__testAttack(hero, enemy, 1);
  const boostedHp = enemy.hp;

  assert.ok(boostedHp < baseHp);
});
