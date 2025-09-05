import assert from 'node:assert/strict';
import { test } from 'node:test';
import '../scripts/procedural-map.js';

test('generateHeightField is deterministic', () => {
  const a = globalThis.generateHeightField(42, 4, 1);
  const b = globalThis.generateHeightField(42, 4, 1);
  assert.deepEqual(a, b);
});

test('generateHeightField supports radial falloff', () => {
  const base = globalThis.generateHeightField(1, 5, 1);
  const fall = globalThis.generateHeightField(1, 5, 1, 1);
  assert.equal(base[2][2], fall[2][2]);
  assert.ok(fall[0][0] < base[0][0]);
});

test('heightFieldToTiles maps heights to elevation types', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5 };
  const field = [
    [-0.7, -0.2, 0.3, 0.8]
  ];
  const tiles = globalThis.heightFieldToTiles(field);
  assert.deepEqual(tiles, [[
    2, // water
    0, // sand
    3, // brush
    5  // rock
  ]]);
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

test('findRegionCenters subdivides large landmass', () => {
  globalThis.TILE = { WATER: 2 };
  const tiles = Array.from({ length: 4 }, () => Array(4).fill(1));
  const centers = globalThis.findRegionCenters(tiles);
  assert.ok(centers.length > 1);
});

test('carveRoads draws road between centers', () => {
  globalThis.TILE = { SAND: 0, ROAD: 4 };
  const size = 5;
  const tiles = Array.from({ length: size }, () => Array(size).fill(0));
  const centers = [{ x: 0, y: 0 }, { x: 4, y: 4 }];
  const edges = [[0, 1]];
  const roaded = globalThis.carveRoads(tiles, centers, edges, 1);
  assert.equal(roaded[0][0], 4);
  assert.equal(roaded[4][4], 4);
  const queue = [[0, 0]];
  const seen = new Set(['0,0']);
  let found = false;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === 4 && y === 4) { found = true; break; }
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (roaded[ny][nx] === 4 && !seen.has(`${nx},${ny}`)) {
          seen.add(`${nx},${ny}`);
          queue.push([nx, ny]);
        }
      }
    }
  }
  assert.ok(found);
});

test('generateProceduralMap returns grid of requested size', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4 };
  const grid = globalThis.generateProceduralMap(1, 10, 8);
  assert.equal(grid.length, 8);
  assert.equal(grid[0].length, 10);
});

test('generateProceduralMap is deterministic', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4 };
  const a = globalThis.generateProceduralMap(42, 12, 12);
  const b = globalThis.generateProceduralMap(42, 12, 12);
  assert.deepEqual(a, b);
});

test('generateProceduralMap adds roads on single land region', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4 };
  const grid = globalThis.generateProceduralMap(2, 16, 16, 4, 0);
  let roads = 0;
  for (const row of grid) {
    for (const t of row) {
      if (t === 4) roads++;
    }
  }
  assert.ok(roads > 0);
});
