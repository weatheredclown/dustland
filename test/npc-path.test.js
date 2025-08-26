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

test('NPC follows waypoints with capped speed and waits when close', async () => {
  await import('../dustland-path.js');
  window.Dustland.path.tickPathAI();
  await new Promise(r => setTimeout(r,20));
  window.Dustland.path.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  party.x = 1; party.y = 0;
  window.Dustland.path.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  party.x = 5; party.y = 5;
  window.Dustland.path.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  await new Promise(r => setTimeout(r,210));
  window.Dustland.path.tickPathAI();
  assert.strictEqual(NPCS[0].x, 2);
});

test('NPC re-pathfinds after being moved', async () => {
  NPCS.length = 0;
  NPCS.push({ id:'n2', map:'world', x:0, y:0, loop:[{x:0,y:0},{x:2,y:0}] });
  party.x = 5; party.y = 5;
  await import('../dustland-path.js');
  global.updateHUD = () => {};
  global.document = {
    getElementById: () => ({ children: [], classList:{ toggle(){}, contains(){ return false; }, add(){}, remove(){} }, style:{}, appendChild(){}, remove(){}, innerHTML:'', textContent:'' }),
    createElement: () => ({ children: [], classList:{ toggle(){}, contains(){ return false; }, add(){}, remove(){} }, style:{}, appendChild(){}, remove(){}, innerHTML:'', textContent:'', onclick:null }),
  };
  await import('../core/dialog.js');
  window.Dustland.path.tickPathAI();
  await new Promise(r => setTimeout(r,20));
  window.Dustland.path.tickPathAI();
  assert.strictEqual(NPCS[0].x, 1);
  const stPre = NPCS[0]._loop;
  assert.ok(stPre && (stPre.path.length > 0 || stPre.job));
  global.currentNPC = NPCS[0];
  window.handleGoto({target:'npc', x:0, y:1, rel:false});
  assert.deepStrictEqual({x:NPCS[0].x, y:NPCS[0].y}, {x:0, y:1});
  const st = NPCS[0]._loop;
  assert.deepStrictEqual(st.path, []);
  assert.strictEqual(st.job, null);
});
