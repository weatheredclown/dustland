import assert from 'node:assert';
import { test } from 'node:test';
import '../core/abilities.js';

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
