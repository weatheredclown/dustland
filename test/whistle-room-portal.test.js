import assert from 'node:assert';
import test from 'node:test';

global.window = globalThis;
global.TILE = { FLOOR:0, DOOR:8 };
global.walkable = { 0:true, 8:true };
global.itemDrops = [];
global.NPCS = [];
global.state = { map:'cavern' };
const handlers = {};
const bus = { on:(e,f)=>{ (handlers[e]=handlers[e]||[]).push(f); }, emit:(e,p)=>{ (handlers[e]||[]).forEach(fn=>fn(p)); } };
global.EventBus = bus;
global.Dustland = { eventBus: bus };

global.portals = [ { map:'cavern', x:0, y:0, toMap:'whistle_room', toX:1, toY:1 } ];
global.buildings = [];

global.interiors = {
  cavern: { grid:[[0]] },
  whistle_room: { grid:[[0,0],[0,0]] }
};

global.world = [[0]];

global.player = { inv:[] };
global.lastInteract = 0;
function getTile(map,x,y){ return interiors[map].grid[y][x]; }
function setTile(map,x,y,t){ interiors[map].grid[y][x]=t; }
function setPartyPos(x,y){ party.x=x; party.y=y; }
function setMap(map){ state.map=map; party.map=map; }

global.getTile = getTile;
global.setTile = setTile;
global.setPartyPos = setPartyPos;
global.setMap = setMap;
global.log = () => {};
global.updateHUD = () => {};
global.getPartyInventoryCapacity = () => 10;

global.party = [{ hp:10 }];
party.x = 0; party.y = 0; party.map = 'cavern';

await import('../scripts/core/movement.js');

test('interact moves through portal on floor tile', () => {
  assert.strictEqual(state.map, 'cavern');
  interactionSystem.interact();
  assert.strictEqual(state.map, 'whistle_room');
  assert.strictEqual(party.x, 1);
  assert.strictEqual(party.y, 1);
});
