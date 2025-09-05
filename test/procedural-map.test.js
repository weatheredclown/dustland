import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
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
  const field = Array.from({ length: size }, () => Array(size).fill(0));
  const centers = [{ x: 0, y: 0 }, { x: 4, y: 4 }];
  const edges = [[0, 1]];
  const roaded = globalThis.carveRoads(tiles, centers, edges, field, 1);
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

test('carveRoads favors contour paths', () => {
  globalThis.TILE = { SAND: 0, ROAD: 4, WATER: 2 };
  const tiles = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  const field = [
    [1, 1, 1],
    [0.5, 0.5, 0.5],
    [0, 0, 0]
  ];
  const centers = [{ x: 0, y: 0 }, { x: 2, y: 0 }];
  const edges = [[0, 1]];
  const roaded = globalThis.carveRoads(tiles, centers, edges, field, 1);
  assert.equal(roaded[0][1], 4);
  assert.notEqual(roaded[1][0], 4);
});

test('scatterRuins respects spacing and terrain', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, ROAD: 4, RUIN: 6 };
  const size = 10;
  const makeGrid = () => {
    const g = Array.from({ length: size }, () => Array(size).fill(0));
    g[0][0] = 2;
    g[1][1] = 4;
    return g;
  };
  const base = makeGrid();
  const a = globalThis.scatterRuins(base.map(r => r.slice()), 5, 3);
  const b = globalThis.scatterRuins(makeGrid(), 5, 3);
  assert.deepEqual(a, b);
  assert.equal(a.tiles[0][0], 2);
  assert.equal(a.tiles[1][1], 4);
  assert.ok(a.ruins.length > 0);
  let clustered = false;
  for (let i = 0; i < a.ruins.length; i++) {
    const r1 = a.ruins[i];
    for (let j = i + 1; j < a.ruins.length; j++) {
      const r2 = a.ruins[j];
      const dx = r1.x - r2.x;
      const dy = r1.y - r2.y;
      const d2 = dx * dx + dy * dy;
      if (d2 <= 2) { clustered = true; break; }
    }
    if (clustered) break;
  }
  assert.ok(clustered);
});

test('generateProceduralMap returns grid of requested size', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const map = globalThis.generateProceduralMap(1, 10, 8);
  assert.equal(map.tiles.length, 8);
  assert.equal(map.tiles[0].length, 10);
});

test('generateProceduralMap is deterministic', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const a = globalThis.generateProceduralMap(42, 12, 12);
  const b = globalThis.generateProceduralMap(42, 12, 12);
  assert.deepEqual(a, b);
});

test('generateProceduralMap adds roads on single land region', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const map = globalThis.generateProceduralMap(2, 16, 16, 4, 0);
  let roads = 0;
  for (const row of map.tiles) {
    for (const t of row) {
      if (t === 4) roads++;
    }
  }
  assert.ok(roads > 0);
});

test('generateProceduralMap scatters ruins', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const map = globalThis.generateProceduralMap(3, 16, 16, 4, 0);
  let ruins = 0;
  for (const row of map.tiles) {
    for (const t of row) {
      if (t === 6) ruins++;
    }
  }
  assert.ok(ruins > 0);
});

test('generateProceduralMap respects feature toggles', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const map = globalThis.generateProceduralMap(5, 16, 16, 4, 0, { roads: false, ruins: false });
  let roads = 0;
  let ruins = 0;
  for (const row of map.tiles) {
    for (const t of row) {
      if (t === 4) roads++;
      if (t === 6) ruins++;
    }
  }
  assert.equal(roads, 0);
  assert.equal(ruins, 0);
});

test('exportMap writes JSON file', async () => {
  const data = { tiles: [[1]], regions: [], roads: [], features: { ruins: [] } };
  const path = 'test-map.json';
  await globalThis.exportMap(data, path);
  const loaded = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.deepEqual(loaded, data);
  fs.unlinkSync(path);
});
