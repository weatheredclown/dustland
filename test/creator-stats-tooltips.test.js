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
    makeMember:(id,name,role)=>({id,name,role,stats:{}}),
    addPartyMember:m=>{ party.push(m); },
    addToInv:()=>{},
    rand:()=>0,
    log:()=>{},
    party,
    Math:Object.assign(Object.create(Math),{random:()=>0})
  };
  vm.createContext(context);
  vm.runInContext(code,context);
  return {context,dom};
}

test('stat labels include names and benefits',()=>{
  const {context,dom}=setup();
  context.openCreator();
  dom.window.document.getElementById('ccNext').onclick();
  const labels=[...dom.window.document.querySelectorAll('#ccRight label')];
  const expected={
    STR:'Strength: helps with DC checks',
    AGI:'Agility: speeds up movement',
    INT:'Intelligence: helps with DC checks',
    PER:'Perception: helps with DC checks',
    LCK:'Luck: boosts damage and healing',
    CHA:'Charisma: helps with DC checks'
  };
  labels.forEach(l=>{
    const key=l.textContent;
    assert.strictEqual(l.getAttribute('title'), expected[key]);
  });
});
