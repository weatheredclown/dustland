import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

async function setupContext() {
  const { context } = createGameProxy([]);
  context.Dustland = { effects:{ tick: () => {} }, path:{}, actions:{ startCombat: () => {} } };
  context.TILE = { ROAD: 0 };
  context.walkable = { 0: true };
  context.world = [ [0,0], [0,0] ];
  context.itemDrops = [];
  context.NPCS = [];
  context.interiors = {};
  context.tileEvents = [];
  context.zoneEffects = [ { map:'world', x:0, y:0, w:2, h:2, perStep:{ hp:-1, msg:'Nanite swarm!' }, negate:'mask' } ];
  context.Dustland.zoneEffects = context.zoneEffects;
  context.clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
  context.enemyBanks = {};
  context.setPartyPos = (x,y)=>{ context.party.x=x; context.party.y=y; };
  context.footstepBump = () => {};
  context.checkAggro = () => {};
  context.checkRandomEncounter = () => {};
  context.updateHUD = () => {};
  context.renderParty = () => {};
  context.centerCamera = () => {};
  context.log = () => {};
  context.toast = () => {};
  context.hasItem = id => context.player.inv.some(i => i.id === id || (i.tags||[]).includes(id));
  context.state.map = 'world';
  context.state.mapEntry = { map:'world', x:0, y:0 };
  context.player.inv = [];
  context.party.x = 0;
  context.party.y = 0;

  const partyCode = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  vm.runInContext(partyCode, context);
  context.party.x = 0;
  context.party.y = 0;
  const m1 = new context.Character('a','A','');
  const m2 = new context.Character('b','B','');
  m1.maxHp = m2.maxHp = 1;
  m1.hp = m2.hp = 1;
  context.party.addMember(m1);
  context.party.addMember(m2);

  const moveCode = await fs.readFile(new URL('../scripts/core/movement.js', import.meta.url), 'utf8');
  vm.runInContext(moveCode, context);
  return context;
}

test('zone drains HP and warps on wipe', async () => {
  const ctx = await setupContext();
  await ctx.move(1,0);
  assert.strictEqual(ctx.party.x, 0);
  assert.strictEqual(ctx.party[0].hp, 1);
});

test('mask negates zone damage', async () => {
  const ctx = await setupContext();
  ctx.player.inv.push({ id:'scrap_mask', tags:['mask'] });
  ctx.party[0].hp = 5; ctx.party[0].maxHp = 5;
  await ctx.move(1,0);
  assert.strictEqual(ctx.party[0].hp, 5);
});
