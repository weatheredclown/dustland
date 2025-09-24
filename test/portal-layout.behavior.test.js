import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

const TILE = { SAND: 0, ROCK: 1, WATER: 2, BRUSH: 3, ROAD: 4, RUIN: 5, WALL: 6, FLOOR: 7, DOOR: 8, BUILDING: 9 };

function makeWorld(w, h, fill = TILE.WATER) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function countTiles(world, tileId) {
  let count = 0;
  world.forEach(row => row.forEach(v => { if (v === tileId) count++; }));
  return count;
}

test('portal layout arranges connected interiors on the world map', () => {
  const context = { Math };
  context.globalThis = context;
  context.TILE = TILE;
  context.WORLD_W = 40;
  context.WORLD_H = 30;
  const world = makeWorld(context.WORLD_W, context.WORLD_H);
  context.world = world;
  context.setTile = (map, x, y, tile) => {
    if (map !== 'world') return;
    if (y < 0 || y >= world.length) return;
    if (x < 0 || x >= world[0].length) return;
    world[y][x] = tile;
  };
  const emojiMap = new Map([
    ['🧱', TILE.WALL],
    ['⬜', TILE.FLOOR],
    ['🚪', TILE.DOOR]
  ]);
  context.gridFromEmoji = rows => rows.map(row => Array.from(row).map(ch => emojiMap.get(ch) ?? TILE.FLOOR));
  const setMapCalls = [];
  context.setMap = (mapId) => { setMapCalls.push(mapId); context.currentMap = mapId; };
  context.Dustland = {};

  const behaviors = fs.readFileSync(new URL('../scripts/core/module-behaviors.js', import.meta.url), 'utf8');
  vm.runInNewContext(behaviors, context, { filename: 'module-behaviors.js' });

  const moduleData = {
    props: { portalLayout: true },
    start: { map: 'roomA', x: 1, y: 1 },
    interiors: [
      {
        id: 'roomA',
        grid: [
          '🧱🧱🧱',
          '⬜⬜🚪',
          '🧱🧱🧱'
        ]
      },
      {
        id: 'roomB',
        grid: [
          '🧱🧱🧱',
          '🚪⬜⬜',
          '🧱🚪🧱'
        ]
      },
      {
        id: 'roomC',
        grid: [
          '🧱🚪🧱',
          '🧱⬜🧱',
          '🧱🧱🧱'
        ]
      }
    ],
    portals: [
      { map: 'roomA', x: 2, y: 1, toMap: 'roomB', toX: 0, toY: 1 },
      { map: 'roomB', x: 0, y: 1, toMap: 'roomA', toX: 2, toY: 1 },
      { map: 'roomB', x: 1, y: 2, toMap: 'roomC', toX: 1, toY: 0 },
      { map: 'roomC', x: 1, y: 0, toMap: 'roomB', toX: 1, toY: 2 }
    ]
  };

  context.Dustland.behaviors.setup(moduleData);

  const wrappedSetMap = context.setMap;
  wrappedSetMap('roomA');
  assert.strictEqual(countTiles(world, TILE.DOOR), 1);

  wrappedSetMap('roomB');
  assert.strictEqual(countTiles(world, TILE.DOOR), 3);

  wrappedSetMap('roomC');
  assert.strictEqual(countTiles(world, TILE.DOOR), 4);

  const doors = [];
  world.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v === TILE.DOOR) doors.push({ x, y });
    });
  });

  const hasHorizontalPair = doors.some(a => doors.some(b => a !== b && a.y === b.y && Math.abs(a.x - b.x) === 1));
  const hasVerticalPair = doors.some(a => doors.some(b => a !== b && a.x === b.x && Math.abs(a.y - b.y) === 1));
  assert.ok(hasHorizontalPair, 'expected adjacent east-west doors');
  assert.ok(hasVerticalPair, 'expected adjacent north-south doors');

  assert.deepStrictEqual(setMapCalls, ['roomA', 'roomB', 'roomC']);
});
