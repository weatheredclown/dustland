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

test('connectRegionCenters plans bridges between islands', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, ROAD: 4 };
  const tiles = [
    [0, 2, 2, 2, 0],
    [0, 2, 2, 2, 0],
    [0, 2, 2, 2, 0]
  ];
  const field = Array.from({ length: 3 }, (_, y) => Array.from({ length: 5 }, (_, x) => y * 0.1 + x * 0.01));
  const centers = [{ x: 0, y: 1 }, { x: 4, y: 1 }];
  const network = globalThis.connectRegionCenters(tiles, field, centers, 5);
  assert.equal(network.anchors.length, 2);
  assert.equal(network.segments.length, 1);
  const seg = network.segments[0];
  assert.ok(seg.bridges.length > 0);
  const startAnchor = network.anchors[seg.from];
  const endAnchor = network.anchors[seg.to];
  assert.deepEqual(seg.path[0], startAnchor);
  assert.deepEqual(seg.path[seg.path.length - 1], endAnchor);
});

test('connectRegionCenters synthesizes anchors on single landmass', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, ROAD: 4 };
  const tiles = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  const field = Array.from({ length: 3 }, () => Array(3).fill(0));
  const centers = [{ x: 1.2, y: 1.8 }];
  const network = globalThis.connectRegionCenters(tiles, field, centers, 9);
  assert.ok(network.anchors.length >= 2);
  assert.ok(network.segments.length >= 1);
  const unique = new Set(network.anchors.map(a => `${a.x},${a.y}`));
  assert.equal(unique.size, network.anchors.length);
});

test('findRegionCenters subdivides large landmass', () => {
  globalThis.TILE = { WATER: 2 };
  const tiles = Array.from({ length: 4 }, () => Array(4).fill(1));
  const centers = globalThis.findRegionCenters(tiles);
  assert.ok(centers.length > 1);
});

test('carveRoads paints paths and records crossroads', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, ROAD: 4 };
  const tiles = Array.from({ length: 5 }, () => Array(5).fill(0));
  const network = {
    anchors: [{ x: 2, y: 2 }, { x: 2, y: 0 }, { x: 4, y: 2 }],
    segments: [
      { from: 0, to: 1, path: [{ x: 2, y: 2 }, { x: 2, y: 1 }, { x: 2, y: 0 }], bridges: [] },
      { from: 0, to: 2, path: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], bridges: [] }
    ]
  };
  const carved = globalThis.carveRoads(tiles, network);
  assert.equal(tiles[2][2], 4);
  assert.equal(tiles[1][2], 4);
  assert.equal(tiles[2][3], 4);
  assert.ok(carved.crossroads.some(pt => pt.x === 2 && pt.y === 2));
  assert.equal(tiles[2][1], 4);
  assert.deepEqual(carved.segments[0].path[0], { x: 2, y: 2 });
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

test('scatterRuins spreads hubs apart', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, ROAD: 4, RUIN: 6 };
  const grid = Array.from({ length: 32 }, () => Array(32).fill(0));
  const res = globalThis.scatterRuins(grid, 7);
  const hubs = res.hubs;
  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const dx = hubs[i].x - hubs[j].x;
      const dy = hubs[i].y - hubs[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      assert.ok(d >= 12);
    }
  }
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
  assert.ok(Array.isArray(map.roads.segments));
  assert.ok(map.roads.segments.length > 0);
  assert.ok(map.roads.anchors.length >= 2);
  assert.ok(Array.isArray(map.roads.crossroads));
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

test('generateProceduralMap groups ruin clusters', () => {
  globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };
  const map = globalThis.generateProceduralMap(7, 32, 32, 4, 0);
  const tiles = map.tiles;
  const h = tiles.length;
  const w = tiles[0].length;
  const seen = Array.from({ length: h }, () => Array(w).fill(false));
  const centers = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (tiles[y][x] !== 6 || seen[y][x]) continue;
      const q = [[x, y]];
      seen[y][x] = true;
      let sx = 0, sy = 0, count = 0;
      while (q.length) {
        const [cx, cy] = q.pop();
        sx += cx; sy += cy; count++;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && tiles[ny][nx] === 6 && !seen[ny][nx]) {
            seen[ny][nx] = true;
            q.push([nx, ny]);
          }
        }
      }
      centers.push({ x: sx / count, y: sy / count });
    }
  }
  assert.ok(centers.length > 1);
  let min = Infinity, max = 0;
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const dx = centers[i].x - centers[j].x;
      const dy = centers[i].y - centers[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < min) min = d;
      if (d > max) max = d;
    }
  }
  assert.ok(min <= 5);
  assert.ok(max >= 10);
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
  assert.deepEqual(map.roads, { anchors: [], segments: [], crossroads: [] });
});

test('exportMap writes JSON file', async () => {
  const data = { tiles: [[1]], regions: [], roads: [], features: { ruins: [] } };
  const path = 'test-map.json';
  await globalThis.exportMap(data, path);
  const loaded = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.deepEqual(loaded, data);
  fs.unlinkSync(path);
});
