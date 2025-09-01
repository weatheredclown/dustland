import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

async function setup(zone){
  const { context } = createGameProxy([]);
  context.Dustland = { effects:{ tick: () => {} }, path:{}, actions:{ startCombat: () => { context.startedCombat = true; } } };
  context.TILE = { ROAD:0 };
  context.walkable = { 1:true, 0:true };
  context.world = [ [1,1], [1,1] ];
  context.WORLD_W = 2;
  context.WORLD_H = 2;
  context.enemyBanks = { world:[{ name:'bug', HP:1, ATK:1, DEF:0 }] };
  context.itemDrops = [];
  context.NPCS = [];
  context.interiors = {};
  context.tileEvents = [];
  context.zoneEffects = zone? [zone] : [];
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
  context.Math.random = () => 1;

  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  const a = new context.Character('a','A','');
  const b = new context.Character('b','B','');
  a.maxHp = b.maxHp = 10;
  a.hp = b.hp = 5;
  context.party.join(a);
  context.party.join(b);
  context.party.x = 0;
  context.party.y = 0;

  const moveCode = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInContext(moveCode, context);
  return context;
}

test('wait heals leader', async () => {
  const ctx = await setup();
  await ctx.wait();
  assert.strictEqual(ctx.party[0].hp, 6);
  assert.strictEqual(ctx.party[1].hp, 5);
});

test('heal zone boosts party regen', async () => {
  const ctx = await setup({ map:'world', x:0, y:0, w:2, h:2, healMult:2 });
  await ctx.wait();
  assert.strictEqual(ctx.party[0].hp, 7);
  assert.strictEqual(ctx.party[1].hp, 7);
});

test('no encounter zone blocks fights', async () => {
  const ctx = await setup({ map:'world', x:0, y:0, w:2, h:2, noEncounters:true });
  ctx.Math.random = () => 0;
  await ctx.wait();
  assert.strictEqual(ctx.startedCombat, undefined);
});
