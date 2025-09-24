import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const code = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');

function setup(){
  const html = `<body><div id="mapname"></div><div id="creator"></div><div id="ccStep"></div><div id="ccRight"></div><div id="ccHint"></div><button id="ccBack"></button><button id="ccNext"></button><div id="ccPortrait"></div><button id="ccStart"></button><button id="ccLoad"></button></body>`;
  const dom = new JSDOM(html);
  const party=[]; party.flags={}; party.map='world'; party.x=0; party.y=0;
  const context={
    window:dom.window,
    document:dom.window.document,
    EventBus:{ on:()=>{}, emit:()=>{} },
    baseStats:()=>({STR:4,AGI:4,INT:4,PER:4,LCK:4,CHA:4}),
    makeMember:(id,name,role)=>({id,name,role,stats:{},special:[],equip:{weapon:null,armor:null,trinket:null}}),
    joinParty:m=>{ party.push(m); },
    rand:()=>0,
    log:()=>{},
    party,
    Math:Object.assign(Object.create(Math),{random:()=>0})
  };
  vm.createContext(context);
  vm.runInContext(code,context);
  const inv=context.player.inv;
  context.addToInv=i=>{ inv.push(i); };
  context.equipItem=(mi,ii)=>{ const m=party[mi]; m.equip=m.equip||{weapon:null,armor:null,trinket:null}; m.equip[inv[ii].type]=inv[ii]; inv.splice(ii,1); };
  return {context,inv};
}

test('specialization and quirk bonuses apply',()=>{
  const {context,inv}=setup();
  context.openCreator();
  vm.runInContext("building.spec='Gunslinger'; building.quirk='Lucky Lint'", context);
  const member=vm.runInContext('finalizeCurrentMember()', context);
  assert.strictEqual(member.stats.AGI,5);
  assert.strictEqual(member.stats.LCK,5);
  const ids=inv.map(i=>i.id);
  assert(!ids.includes('dawnforge_six_shooter'));
  assert(ids.includes('lucky_coin'));
  assert.strictEqual(context.party[0].equip.weapon.id,'dawnforge_six_shooter');
  assert.strictEqual(context.party[0].equip.trinket,null);
});
