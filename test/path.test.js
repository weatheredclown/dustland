import assert from 'node:assert';
import test from 'node:test';

// minimal globals
global.window = globalThis;

global.TILE = { FLOOR:0, WALL:1 };
global.walkable = { 0:true };

global.world = [
  [0,0,0],
  [1,1,0],
  [0,0,0]
];

global.queryTile = (x,y,map='world') => {
  const tile = world[y] && world[y][x];
  return { tile, walkable: tile === 0, entities: [] };
};

global.NPCS = [];

test('PathQueue finds a path', async () => {
  await import('../dustland-path.js');
  const key = window.PathQueue.queue('world',{x:0,y:0},{x:2,y:2});
  await new Promise(r => setTimeout(r,20));
  const path = window.PathQueue.pathFor(key);
  assert.ok(path && path.length > 0, 'path exists');
  assert.deepStrictEqual(path[0], {x:0,y:0});
  assert.deepStrictEqual(path[path.length-1], {x:2,y:2});
});
