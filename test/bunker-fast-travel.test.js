import assert from 'node:assert';
import test from 'node:test';

const TILE = { FLOOR:0, DOOR:1, BUILDING:2 };
const walkable = {0:true,1:true,2:false};

function makeGrid(w,h,fill){
  return Array.from({length:h},()=>Array(w).fill(fill));
}

test('entering bunker opens world map and activates fast travel', async () => {
  global.TILE = TILE;
  global.walkable = walkable;
  global.WORLD_W = 5;
  global.WORLD_H = 5;
  const world = makeGrid(5,5,TILE.FLOOR);
  world[0][0] = TILE.DOOR;
  global.world = world;
  global.interiors = {};
  global.portals = [];
  global.itemDrops = [];
  global.buildings = [{ x:0, y:0, w:1, h:1, doorX:0, doorY:0, interiorId:null, boarded:false, bunker:true, bunkerId:'bunker_0_0', under:[[TILE.FLOOR]], grid:[[TILE.DOOR]] }];
  const party = { x:0, y:0 };
  const state = { map:'world' };
  global.party = party;
  global.state = state;
  let opened = false;
  global.openWorldMap = () => { opened = true; };
  const handlers = {};
  const bus = { on:(e,f)=>{ (handlers[e]=handlers[e]||[]).push(f); }, emit:(e,p)=>{ (handlers[e]||[]).forEach(fn=>fn(p)); } };
  global.EventBus = bus;
  let activated = null;
  global.Dustland = { eventBus: bus, fastTravel:{ activateBunker:id=>{ activated=id; } } };
  global.log = () => {};
  global.updateHUD = () => {};
  global.renderParty = () => {};
  global.renderInv = () => {};
  global.renderQuests = () => {};
  global.toast = () => {};
  global.openDialog = () => {};
  global.pickupSparkle = () => {};
  global.centerCamera = () => {};
  global.checkAggro = () => {};
  global.checkRandomEncounter = () => {};
  global.zoneAttrs = () => ({ healMult:1, noEncounters:true, spawns:null });
  global.Effects = { tick(){}, apply(){} };
  global.getPartyInventoryCapacity = () => 10;
  global.leader = () => ({ hp:10, maxHp:10 });
  global.getTile = (map,x,y) => world[y][x];
  global.setPartyPos = () => {};
  global.setMap = m => { state.map = m; };

  const fs = await import('node:fs');
  const vm = await import('node:vm');
  const src = fs.readFileSync(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInThisContext(src);

  interactAt(0,0);

  assert.strictEqual(opened, true);
  assert.strictEqual(activated, 'bunker_0_0');
  assert.strictEqual(state.map, 'world');
});
