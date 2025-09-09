import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

async function setupContext(){
  const { context } = createGameProxy([]);
  context.Dustland = { effects:{ tick: () => {} }, path:{}, actions:{ startCombat: () => {} } };
  context.TILE = { ROAD:0 };
  context.walkable = { 0:true };
  context.world = [[0,0],[0,0]];
  context.WORLD_W = 2;
  context.WORLD_H = 2;
  context.enemyBanks = {};
  context.itemDrops = [];
  context.NPCS = [];
  context.interiors = {};
  context.tileEvents = [];
  context.zoneEffects = [ { map:'world', x:1, y:0, w:1, h:1, perStep:{ msg:'Fog' } } ];
  context.Dustland.zoneEffects = context.zoneEffects;
  context.clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
  context.setPartyPos = (x,y)=>{ context.party.x=x; context.party.y=y; };
  context.footstepBump = () => {};
  context.checkAggro = () => {};
  context.checkRandomEncounter = () => {};
  context.updateHUD = () => {};
  context.renderParty = () => {};
  context.centerCamera = () => {};
  context.logs = [];
  context.log = msg => context.logs.push(msg);
  context.toast = () => {};
  context.hasItem = () => false;
  context.state.map = 'world';
  context.state.mapEntry = { map:'world', x:0, y:0 };
  context.Math = Object.create(Math);
  context.Math.random = () => 1;

  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  const m = new context.Character('a','A','');
  m.maxHp = 10; m.hp = 5;
  context.party.join(m);
  context.party.x = 0;
  context.party.y = 0;
  context.logs = [];

  const moveCode = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInContext(moveCode, context);
  return context;
}

test('message-only zone logs on enter and exit', async () => {
  const ctx = await setupContext();
  await ctx.move(1,0);
  assert.deepStrictEqual(ctx.logs, ['entering: Fog']);
  await ctx.wait();
  assert.deepStrictEqual(ctx.logs, ['entering: Fog']);
  await ctx.move(-1,0);
  assert.deepStrictEqual(ctx.logs, ['entering: Fog', 'exiting: Fog']);
});
