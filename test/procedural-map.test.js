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
  globalThis.TILE = { SAND: 0, WATER: 2, WALL: 6, ROAD: 4 };
  const grid = globalThis.generateProceduralMap(1, 10, 8);
  assert.equal(grid.length, 8);
  assert.equal(grid[0].length, 10);
});

test('generateProceduralMap is deterministic', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, WALL: 6, ROAD: 4 };
  const a = globalThis.generateProceduralMap(42, 12, 12);
  const b = globalThis.generateProceduralMap(42, 12, 12);
  assert.deepEqual(a, b);
});
