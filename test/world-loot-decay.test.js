import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import './fast-timeouts.js';

test('world loot decays after configured turns', async () => {
  const TILE = { SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 };
  const walkable = {0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};
  globalThis.TILE = TILE;
  globalThis.walkable = walkable;
  globalThis.clamp = (v, a, b) => {
    if (a > b) [a, b] = [b, a];
    return Math.max(a, Math.min(b, v));
  };
  globalThis.WORLD_W = 6;
  globalThis.WORLD_H = 6;
  const world = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(TILE.SAND));
  globalThis.world = world;
  globalThis.interiors = {};
  globalThis.portals = [];
  globalThis.buildings = [];
  globalThis.enemyBanks = {};
  globalThis.enemyTurnStats = {};
  globalThis.tileEvents = [];
  const party = [{ id: 'p1', name: 'Test', role: 'scout', hp: 10, maxHp: 10, adr: 0, stats: {}, equip: {} }];
  party.x = 2;
  party.y = 2;
  party.map = 'world';
  globalThis.party = party;
  const state = { map: 'world', mapEntry: null };
  globalThis.state = state;
  globalThis.player = { hp: 10, inv: [], scrap: 0 };
  globalThis.log = () => {};
  globalThis.toast = () => {};
  globalThis.renderParty = () => {};
  globalThis.renderInv = () => {};
  globalThis.renderQuests = () => {};
  globalThis.updateHUD = () => {};
  globalThis.centerCamera = () => {};
  globalThis.updateZoneMsgs = () => {};
  globalThis.applyZones = () => {};
  globalThis.footstepBump = () => {};
  globalThis.pickupSparkle = () => {};
  globalThis.getPartyInventoryCapacity = () => 10;
  globalThis.addToInv = () => {};
  globalThis.getItem = () => null;
  globalThis.ITEMS = {};
  globalThis.checkFlagCondition = () => true;
  globalThis.tickStatuses = () => {};
  globalThis.leader = () => party[0];
  globalThis.setPartyPos = (x, y) => { party.x = x; party.y = y; };
  globalThis.setMap = (map) => { state.map = map; party.map = map; };
  const handlers = new Map();
  const bus = {
    on(event, fn){
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event).add(fn);
    },
    off(event, fn){
      handlers.get(event)?.delete(fn);
    },
    emit(event, payload){
      handlers.get(event)?.forEach(fn => fn(payload));
    }
  };
  globalThis.EventBus = bus;
  const effectsStub = { tick() {}, apply() {} };
  globalThis.Dustland = {
    eventBus: bus,
    effects: effectsStub,
    actions: { startCombat: () => ({ result: 'flee' }) },
    path: { tickPathAI() {} },
    zoneEffects: [],
    weather: { getWeather: () => null, setWeather() {} },
    fastTravel: {},
    worldMap: {}
  };
  globalThis.Effects = effectsStub;
  globalThis.NPCS = [];
  globalThis.itemDrops = [];

  const code = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: 'movement.js' });

  const { move, getWorldTurns, WORLD_LOOT_DECAY_TURNS } = globalThis.Dustland.movement;
  assert.strictEqual(typeof move, 'function');

  const worldDrop = { id: 'loot-cache', map: 'world', x: party.x, y: party.y, dropType: 'loot' };
  const interiorDrop = { id: 'safe-cache', map: 'bunker', x: 1, y: 1 };
  globalThis.itemDrops.push(worldDrop, interiorDrop);

  for (let i = 0; i < WORLD_LOOT_DECAY_TURNS - 1; i++) {
    await move(0, 0);
  }
  assert.ok(globalThis.itemDrops.includes(worldDrop));
  assert.ok(globalThis.itemDrops.includes(interiorDrop));
  assert.strictEqual(getWorldTurns(), WORLD_LOOT_DECAY_TURNS - 1);

  await move(0, 0);
  assert.ok(!globalThis.itemDrops.includes(worldDrop));
  assert.ok(globalThis.itemDrops.includes(interiorDrop));
  assert.strictEqual(getWorldTurns(), WORLD_LOOT_DECAY_TURNS);
});
