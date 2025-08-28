import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/core/abilities.js';

test('defineAbility stores ability with cost and prereqs', () => {
  const ability = globalThis.defineAbility('powerStrike', {
    type: 'active',
    cost: 2,
    prereq: { level: 5, abilities: ['basicSlash'] },
    effect: { damageBoost: 3 }
  });
  assert.strictEqual(globalThis.Abilities.powerStrike, ability);
  assert.strictEqual(ability.cost, 2);
  assert.strictEqual(ability.prereq.level, 5);
  assert.deepStrictEqual(ability.prereq.abilities, ['basicSlash']);
  assert.deepStrictEqual(ability.effect, { damageBoost: 3 });
});

test('defineAbility supports passive abilities', () => {
  const ability = globalThis.defineAbility('ironSkin', {
    type: 'passive',
    cost: 1,
    prereq: { level: 2 },
    effect: { defBoost: 1 }
  });
  assert.strictEqual(ability.type, 'passive');
  assert.strictEqual(ability.prereq.level, 2);
  assert.deepStrictEqual(ability.prereq.abilities, []);
});

test('defineSpecial registers special with fields and defaults', () => {
  const special = globalThis.defineSpecial('stunGrenade', {
    adrenaline_cost: 20,
    target_type: 'aoe',
    effect: { stun: 2 },
    wind_up_time: 1
  });
  assert.strictEqual(globalThis.Specials.stunGrenade, special);
  assert.strictEqual(special.adrenaline_cost, 20);
  assert.strictEqual(special.target_type, 'aoe');
  assert.deepStrictEqual(special.effect, { stun: 2 });
  assert.strictEqual(special.wind_up_time, 1);

  const defaults = globalThis.defineSpecial('quickJab');
  assert.strictEqual(defaults.adrenaline_cost, 0);
  assert.strictEqual(defaults.target_type, 'single');
  assert.deepStrictEqual(defaults.effect, {});
  assert.strictEqual(defaults.wind_up_time, 0);
});

test('starter specials load from data file', async () => {
  await new Promise((r) => setTimeout(r, 50));
  const ids = ['POWER_STRIKE', 'STUN_GRENADE', 'FIRST_AID', 'ADRENAL_SURGE', 'GUARD_UP'];
  ids.forEach((id) => assert.ok(globalThis.Specials[id]));
});
