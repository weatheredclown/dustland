import assert from 'node:assert';
import test from 'node:test';

const TILE = { SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 };
const walkable = {0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};

function gridFromEmoji(rows){
  const map = { '\u{1F9F1}':TILE.WALL, '\u{2B1C}':TILE.FLOOR, '\u{1F33F}':TILE.BRUSH, '\u{1F6AA}':TILE.DOOR };
  return rows.map(r => Array.from(r).map(ch => map[ch] ?? TILE.FLOOR));
}

test('hall door opens to world after 100 turns', async () => {
  global.TILE = TILE;
  global.walkable = walkable;
  global.WORLD_W = 120;
  global.WORLD_H = 90;
  const world = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(TILE.SAND));
  const interiors = {};
  const portals = [];
  const party = [{ hp:10, maxHp:10 }];
  party.x = 15; party.y = 18; party.map = 'hall';
  const state = { map: 'hall', mapEntry: null };
  global.world = world;
  global.interiors = interiors;
  global.portals = portals;
  global.party = party;
  global.state = state;
  global.player = { hp:10, inv:[], scrap:0 };
  global.NPCS = [];
  global.itemDrops = [];
  global.buildings = [];
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
  global.leader = () => party[0];
  function getTile(map,x,y){
    return (map==='world'?world:interiors[map].grid)[y][x];
  }
  function setTile(map,x,y,t){
    (map==='world'?world:interiors[map].grid)[y][x]=t;
  }
  global.getTile = getTile;
  global.setTile = setTile;
  function setPartyPos(x,y){ party.x=x; party.y=y; }
  function setMap(map){ state.map=map; party.map=map; }
  global.setPartyPos = setPartyPos;
  global.setMap = setMap;

  const handlers = {};
  const bus = { on:(e,f)=>{ (handlers[e]=handlers[e]||[]).push(f); }, emit:(e,p)=>{ (handlers[e]||[]).forEach(fn=>fn(p)); } };
  global.Dustland = { eventBus: bus };
  global.EventBus = bus;

  const fs = await import('node:fs');
  const vm = await import('node:vm');
  const src = fs.readFileSync(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  vm.runInThisContext(src);

  const hall = global.DUSTLAND_MODULE.interiors.find(i => i.id === 'hall');
  interiors.hall = { ...hall, grid: gridFromEmoji(hall.grid) };
  global.DUSTLAND_MODULE.postLoad(global.DUSTLAND_MODULE);

  assert.strictEqual(getTile('hall', 15, 18), TILE.FLOOR);
  assert.strictEqual(portals.length, 0);

  for(let i=0;i<100;i++) bus.emit('sfx','step');

  assert.strictEqual(getTile('hall', 15, 18), TILE.DOOR);
  assert.ok(portals.some(p => p.map === 'hall' && p.toMap === 'world'));

  const p = portals.find(p => p.map === state.map && p.x === party.x && p.y === party.y);
  if (p) { setPartyPos(p.toX, p.toY); setMap(p.toMap); }
  assert.strictEqual(state.map, 'world');
});
