import assert from 'node:assert';
import test from 'node:test';

global.window = globalThis;

global.TILE = { FLOOR:0, WALL:1 };
global.walkable = { 0:true };

global.world = [
  [0,0,0],
  [0,0,0],
  [0,0,0]
];

global.queryTile = (x,y,map='world') => {
  const tile = world[y] && world[y][x];
  return { tile, walkable: tile===0, entities: [] };
};

global.NPCS = [
  { id:'n1', map:'world', x:0, y:0, loop:[{x:0,y:0},{x:2,y:0}] }
];

global.party = { x:5, y:5 };

test('NPC follows waypoints per player move and waits when close', async () => {
  await import('../dustland-path.js');
  window.tickPathAI();
  await new Promise(r => setTimeout(r,20));
  window.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  party.x = 1; party.y = 0;
  window.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  party.x = 5; party.y = 5;
  window.tickPathAI();
  assert.strictEqual(NPCS[0].x, 2);
});
