import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

async function setup(){
  const { context } = createGameProxy([]);
  context.Dustland = { effects:{ tick: () => {} }, path:{}, actions:{ startCombat: def => { context.spawned = def; context.combatCount = (context.combatCount||0)+1; } } };
  context.TILE = { ROAD:0 };
  context.walkable = { 0:true };
  context.world = [[0]];
  context.WORLD_W = 1;
  context.WORLD_H = 1;
  context.enemyBanks = { world: [] };
  context.itemDrops = [];
  context.NPCS = [];
  context.interiors = {};
  context.tileEvents = [];
  context.zoneEffects = [ { map:'world', x:0, y:0, w:1, h:1, spawns:[{ name:'bug', HP:1, ATK:1, DEF:0, prob:1 }], minSteps:2, maxSteps:2 } ];
  context.Dustland.zoneEffects = context.zoneEffects;
  context.clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
  context.setPartyPos = (x,y)=>{ context.party.x=x; context.party.y=y; };
  context.footstepBump = () => {};
  context.checkAggro = () => {};
  context.updateHUD = () => {};
  context.renderParty = () => {};
  context.centerCamera = () => {};
  context.log = () => {};
  context.toast = () => {};
  context.hasItem = () => false;
  context.state.map = 'world';
  context.state.mapEntry = { map:'world', x:0, y:0 };
  context.Math = Object.create(Math);
  context.Math.random = () => 0;

  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  const a = new context.Character('a','A','');
  a.maxHp = a.hp = 10;
  context.party.join(a);
  context.party.x = 0;
  context.party.y = 0;

  const moveCode = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInContext(moveCode, context);
  return context;
}

test('zone spawns respect probability and cooldown', async () => {
  const ctx = await setup();
  await ctx.wait();
  assert.strictEqual(ctx.spawned.name, 'bug');
  assert.strictEqual(ctx.combatCount, 1);
  await ctx.wait();
  assert.strictEqual(ctx.combatCount, 1);
  await ctx.wait();
  assert.strictEqual(ctx.combatCount, 1);
  await ctx.wait();
  assert.strictEqual(ctx.combatCount, 2);
});
