import assert from 'node:assert/strict';
import { test } from 'node:test';
import '../scripts/procedural-map.js';

test('generateHeightField is deterministic', () => {
  const a = globalThis.generateHeightField(42, 4, 1);
  const b = globalThis.generateHeightField(42, 4, 1);
  assert.deepEqual(a, b);
});

test('generateHeightField applies radial falloff', () => {
  const field = globalThis.generateHeightField(1, 3, 1);
  assert(field[1][1] > field[0][0]);
});
