import assert from 'node:assert';
import test from 'node:test';

const TILE = { FLOOR: 0, DOOR: 1 };
const walkable = { 0: true, 1: true };

function makeGrid(w, h, fill) {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

test('exiting building returns party to door tile', async () => {
  global.TILE = TILE;
  global.walkable = walkable;
  global.WORLD_W = 5;
  global.WORLD_H = 5;
  const world = makeGrid(5, 5, TILE.FLOOR);
  const interiors = { hut: { grid: [[TILE.FLOOR, TILE.FLOOR], [TILE.FLOOR, TILE.DOOR]], w: 2, h: 2 } };
  const party = { x: 1, y: 1 };
  const state = { map: 'hut' };
  global.world = world;
  global.interiors = interiors;
  global.portals = [];
  global.buildings = [{ interiorId: 'hut', doorX: 3, doorY: 4 }];
  global.party = party;
  global.state = state;
  global.NPCS = [];
  global.itemDrops = [];
  global.log = () => {};
  global.updateHUD = () => {};
  global.EventBus = { on: () => {}, emit: () => {} };
  global.Dustland = { eventBus: global.EventBus };
  global.getTile = (map, x, y) => (map === 'world' ? world[y][x] : interiors[map].grid[y][x]);
  global.setPartyPos = (x, y) => { party.x = x; party.y = y; };
  global.setMap = (m) => { state.map = m; };

  const fs = await import('node:fs');
  const vm = await import('node:vm');
  const src = fs.readFileSync(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInThisContext(src);

  interactAt(1, 1);

  assert.strictEqual(state.map, 'world');
  assert.strictEqual(party.x, 3);
  assert.strictEqual(party.y, 4);
});
