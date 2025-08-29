import assert from 'node:assert';
import { test } from 'node:test';
import '../scripts/core/party.js';

test('party prevents duplicates and can reorder members', () => {
  party.length = 0;
  const a = makeMember('a', 'A', 'Hero');
  const b = makeMember('b', 'B', 'Mage');
  party.push(a);
  party.push(a);
  assert.strictEqual(party.length, 1);
  party.push(b);
  party.push(b);
  assert.strictEqual(party.length, 2);
  party.setMembers([b, a, a]);
  assert.deepStrictEqual(Array.from(party, m => m.id), ['b', 'a']);
});
