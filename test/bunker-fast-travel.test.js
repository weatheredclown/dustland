import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const TILE = { FLOOR:0, DOOR:1, BUILDING:2 };
const walkable = {0:true,1:true,2:false};

function makeGrid(w,h,fill){
  return Array.from({length:h},()=>Array(w).fill(fill));
}

global.Dustland = {};
global.EventBus = { on(){}, emit(){} };

const movementSrc = fs.readFileSync(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
vm.runInThisContext(movementSrc);

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
  let opened = null;
  global.openWorldMap = id => { opened = id; };
  const handlers = {};
  const bus = { on:(e,f)=>{ (handlers[e]=handlers[e]||[]).push(f); }, emit:(e,p)=>{ (handlers[e]||[]).forEach(fn=>fn(p)); } };
  Dustland.eventBus = bus;
  let activated = null;
  Dustland.fastTravel = { activateBunker:id=>{ activated=id; } };
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

  interactAt(0,0);

  assert.strictEqual(opened, 'bunker_0_0');
  assert.strictEqual(activated, 'bunker_0_0');
  assert.strictEqual(state.map, 'world');
});

test('traveling between bunkers moves the party to the destination', async () => {
  global.TILE = TILE;
  global.walkable = walkable;
  global.WORLD_W = 5;
  global.WORLD_H = 5;
  const world = makeGrid(5,5,TILE.FLOOR);
  world[0][0] = TILE.DOOR;
  world[0][4] = TILE.DOOR;
  global.world = world;
  global.interiors = {};
  global.portals = [];
  global.itemDrops = [];
  global.buildings = [
    { x:0, y:0, w:1, h:1, doorX:0, doorY:0, interiorId:null, boarded:false, bunker:true, bunkerId:'bunker_left', under:[[TILE.FLOOR]], grid:[[TILE.DOOR]] },
    { x:4, y:0, w:1, h:1, doorX:4, doorY:0, interiorId:null, boarded:false, bunker:true, bunkerId:'bunker_right', under:[[TILE.FLOOR]], grid:[[TILE.DOOR]] }
  ];
  const party = { x:0, y:0 };
  const state = { map:'world' };
  global.party = party;
  global.state = state;

  const dom = new JSDOM('<!doctype html><body></body>');
  global.window = dom.window;
  global.document = dom.window.document;
  const dummyCtx = { fillStyle:'', fillRect(){}, fillText(){} };
  dom.window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
  global.alert = () => {};
  global.confirm = () => true;
  global.applyModule = () => {};

  let opened = null;
  const handlers = {};
  const bus = { on:(e,f)=>{ (handlers[e]=handlers[e]||[]).push(f); }, emit:(e,p)=>{ (handlers[e]||[]).forEach(fn=>fn(p)); } };
  Dustland.eventBus = bus;
  global.player = { fuel:10 };
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
  global.setPartyPos = (x,y) => { party.x = x; party.y = y; };
  global.setMap = m => { state.map = m; };

  Dustland.bunkers = [
    { id:'bunker_left', x:0, y:0, active:true },
    { id:'bunker_right', x:4, y:0, active:true }
  ];

  vm.runInThisContext(fs.readFileSync(new URL('../scripts/core/fast-travel.js', import.meta.url), 'utf8'));
  vm.runInThisContext(fs.readFileSync(new URL('../scripts/ui/world-map.js', import.meta.url), 'utf8'));

  global.openWorldMap = id => { opened = id; Dustland.worldMap.open(id); };

  interactAt(0,0);

  assert.strictEqual(opened, 'bunker_left');

  const thumb = document.querySelector('#worldMap canvas');
  thumb.onclick();

  assert.strictEqual(party.x, 4);
  assert.strictEqual(party.y, 0);
});
