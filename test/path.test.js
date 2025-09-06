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

await import('../scripts/dustland-path.js');
const { queue, pathFor, MAX_CACHE } = window.Dustland.path;

async function waitFor(key){
  for(let i=0;i<1000;i++){
    const p = pathFor(key);
    if(p) return p;
    await new Promise(r=>setTimeout(r,0));
  }
  throw new Error('timeout waiting for path');
}

test('PathQueue finds a path', async () => {
  const key = queue('world',{x:0,y:0},{x:2,y:2});
  const path = await waitFor(key);
  assert.ok(path && path.length > 0, 'path exists');
  assert.deepStrictEqual(path[0], {x:0,y:0});
  assert.deepStrictEqual(path[path.length-1], {x:2,y:2});
});

test('PathQueue reuses cached paths', async () => {
  const key = queue('reuse',{x:0,y:0},{x:2,y:2});
  const path = await waitFor(key);
  const again = queue('reuse',{x:0,y:0},{x:2,y:2});
  assert.strictEqual(again, key);
  assert.deepStrictEqual(pathFor(again), path);
});

test('PathQueue evicts oldest cache entries', async () => {
  const keys=[];
  for(let i=0;i<MAX_CACHE;i++){
    keys.push(queue('m'+i,{x:0,y:0},{x:2,y:2}));
  }
  await waitFor(keys[keys.length-1]);
  assert.ok(pathFor(keys[0]));
  const extra=queue('extra',{x:0,y:0},{x:2,y:2});
  await waitFor(extra);
  assert.strictEqual(pathFor(keys[0]), null);
  assert.ok(pathFor(extra));
});
