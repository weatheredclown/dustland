import assert from 'node:assert';
import test from 'node:test';

// minimal globals
global.window = globalThis;
global.TILE = { FLOOR:0 };
global.walkable = { 0:true };
global.itemDrops = [];
global.NPCS = [];
global.state = { map:'world' };
global.EventBus = { on(){}, emit(){} };
global.Dustland = { eventBus: EventBus };

import './fast-timeouts.js';

await import('../scripts/core/movement.js');
await import('../scripts/dustland-path.js');

test('locked door blocks movement and path', async () => {
  global.world = [
    [0,0,0],
    [1,1,1]
  ];
  global.NPCS = [{ id:'doorL', map:'world', x:1, y:0, door:true, locked:true }];
  assert.strictEqual(canWalk(1,0), false);
  const key = window.Dustland.path.queue('world',{x:0,y:0},{x:2,y:0});
  await Promise.resolve();
  const path = window.Dustland.path.pathFor(key);
  assert.deepStrictEqual(path, []);
});

test('unlocked door allows movement and path', async () => {
  global.world = [
    [1,1,1],
    [0,0,0]
  ];
  global.NPCS = [{ id:'doorU', map:'world', x:1, y:1, door:true, locked:false }];
  assert.strictEqual(canWalk(1,1), true);
  const key = window.Dustland.path.queue('world',{x:0,y:1},{x:2,y:1});
  await Promise.resolve();
  const path = window.Dustland.path.pathFor(key);
  assert.deepStrictEqual(path, [{x:0,y:1},{x:1,y:1},{x:2,y:1}]);
});

