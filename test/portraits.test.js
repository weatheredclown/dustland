import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const coreCode = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');
const combatCode = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');

function setup(){
  const html = `<body><div id="mapname"></div><div id="creator"></div><div id="ccStep"></div><div id="ccRight"></div><div id="ccHint"></div><button id="ccBack"></button><button id="ccNext"></button><div id="ccPortrait"></div><button id="ccStart"></button><button id="ccLoad"></button><div id="combatOverlay"></div><div id="combatEnemies"></div><div id="combatParty"></div><div id="combatCmd"></div></body>`;
  const dom = new JSDOM(html);
  const party=[]; party.flags={}; party.map='world'; party.x=0; party.y=0;
  const context={
    window:dom.window,
    document:dom.window.document,
    EventBus:{ on:()=>{}, emit:()=>{} },
    baseStats:()=>({STR:4,AGI:4,INT:4,PER:4,LCK:4,CHA:4}),
    makeMember:(id,name,role,opts={})=>({id,name,role,stats:{},...opts}),
    addPartyMember:m=>{ party.push(m); },
    addToInv:()=>{},
    rand:()=>0,
    log:()=>{},
    party,
    player:{inv:[]},
    Math:Object.assign(Object.create(Math),{random:()=>0})
  };
  vm.createContext(context);
  vm.runInContext(coreCode,context);
  vm.runInContext(combatCode,context);
  return {context,dom};
}

test('creator assigns chosen portrait to member', () => {
  const {context,dom} = setup();
  context.openCreator();
  dom.window.document.getElementById('nextP').onclick();
  context.finalizeCurrentMember();
  assert.strictEqual(context.party[0].portraitSheet, 'assets/portraits/portrait_1001.png');
});

test('creator supports highest portrait id', () => {
  const {context} = setup();
  context.openCreator();
  vm.runInContext('portraitIndex = 89;', context);
  context.setCreatorPortrait();
  context.finalizeCurrentMember();
  assert.strictEqual(context.party[0].portraitSheet, 'assets/portraits/portrait_1089.png');
});

test('combat uses member portrait', () => {
  const {context,dom} = setup();
  context.openCreator();
  context.finalizeCurrentMember();
  const el = dom.window.document.createElement('div');
  context.setPortraitDiv(el, context.party[0]);
  assert.ok(el.style.backgroundImage.includes('assets/portraits/portrait_1000.png'));
});

test('creator picks random default portrait', () => {
  const {context} = setup();
  context.Math.random = () => 0.5;
  context.openCreator();
  const sheet = vm.runInContext('building.portraitSheet', context);
  assert.strictEqual(sheet, 'assets/portraits/portrait_1045.png');
});

test('named NPC keeps consistent 2x2 frame', () => {
  const {context,dom} = setup();
  context.worldSeed = 123;
  const npc = { id:'grin', portraitSheet:'assets/portraits/grin_4.png' };
  const el1 = dom.window.document.createElement('div');
  const el2 = dom.window.document.createElement('div');
  context.setPortraitDiv(el1, npc);
  context.setPortraitDiv(el2, npc);
  assert.strictEqual(el1.style.backgroundPosition, el2.style.backgroundPosition);
});

test('generic portrait picks random frame each call', () => {
  const {context,dom} = setup();
  const npc = { id:'raider', portraitSheet:'assets/portraits/raider_4.png', portraitLock:false };
  context.Math.random = () => 0;
  const el1 = dom.window.document.createElement('div');
  context.setPortraitDiv(el1, npc);
  context.Math.random = () => 0.75;
  const el2 = dom.window.document.createElement('div');
  context.setPortraitDiv(el2, npc);
  assert.notStrictEqual(el1.style.backgroundPosition, el2.style.backgroundPosition);
});
