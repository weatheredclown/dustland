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

test('heightFieldToTiles maps heights to tiles', () => {
  globalThis.TILE = { SAND: 0, WATER: 2 };
  const field = [
    [0.1, 0.6],
    [0.4, 0.8]
  ];
  const tiles = globalThis.heightFieldToTiles(field, 0.5);
  assert.deepEqual(tiles, [
    [2, 0],
    [2, 0]
  ]);
});
