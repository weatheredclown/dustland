import { test } from 'node:test';
import assert from 'node:assert';
import '../scripts/procedural-map.js';

globalThis.TILE = { SAND: 0, WATER: 2, BRUSH: 3, ROCK: 5, ROAD: 4, RUIN: 6 };

// simulate module postLoad registering generateMap
function createModule(seed) {
  const module = { procGen: { seed, falloff: 0, roads: true, ruins: true } };
  module.generateMap = (regen) => {
    const cfg = module.procGen;
    if (!regen && !Number.isFinite(cfg.seed)) cfg.seed = Date.now();
    const map = globalThis.generateProceduralMap(cfg.seed, 8, 8, 4, cfg.falloff, { roads: cfg.roads, ruins: cfg.ruins });
    module.world = map.tiles;
  };
  return module;
}

test('generateMap regenerates deterministically', () => {
  const mod = createModule(42);
  mod.generateMap(false);
  const first = JSON.stringify(mod.world);
  mod.generateMap(true);
  const second = JSON.stringify(mod.world);
  assert.strictEqual(first, second);
});
