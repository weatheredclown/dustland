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

test('refineTiles smooths stray cells', () => {
  globalThis.TILE = { SAND: 0, WATER: 2 };
  const grid = [
    [2, 2, 2, 2, 2],
    [2, 0, 0, 0, 2],
    [2, 0, 2, 0, 2],
    [2, 0, 0, 0, 2],
    [2, 2, 2, 2, 2]
  ];
  const refined = globalThis.refineTiles(grid, 1);
  assert.equal(refined[2][2], 0);
});

test('refineTiles removes isolated land', () => {
  globalThis.TILE = { SAND: 0, WATER: 2 };
  const grid = [
    [2, 2, 2],
    [2, 0, 2],
    [2, 2, 2]
  ];
  const refined = globalThis.refineTiles(grid, 1);
  assert.deepEqual(refined, [
    [2, 2, 2],
    [2, 2, 2],
    [2, 2, 2]
  ]);
});

test('markWalls marks coast tiles', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, WALL: 6 };
  const grid = [
    [2, 2, 2],
    [2, 0, 2],
    [2, 2, 2]
  ];
  const withWalls = globalThis.markWalls(grid);
  assert.equal(withWalls[1][1], 6);
});

test('markWalls leaves interior land as sand', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, WALL: 6 };
  const grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  const withWalls = globalThis.markWalls(grid);
  assert.deepEqual(withWalls, grid);
});

test('connectRegionCenters builds MST', () => {
  const centers = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 }
  ];
  const edges = globalThis.connectRegionCenters(centers);
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  assert.deepEqual(edges, [
    [0, 1],
    [0, 2]
  ]);
});

test('connectRegionCenters handles single region', () => {
  const edges = globalThis.connectRegionCenters([{ x: 1, y: 1 }]);
  assert.deepEqual(edges, []);
});
