import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import './fast-timeouts.js';

function stubEl(){
  const el = {
    style:{ _props:{}, setProperty(k,v){ this._props[k]=v; }, getPropertyValue(k){ return this._props[k]||''; } },
    classList:{
      _set:new Set(),
      toggle(c){ this._set.has(c)?this._set.delete(c):this._set.add(c); },
      add(c){ this._set.add(c); },
      remove(c){ this._set.delete(c); },
      contains(c){ return this._set.has(c); }
    },
    textContent:'',
    onclick:null,
    _innerHTML:'',
    children:[],
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    addEventListener(){},
    parentElement:{ appendChild:()=>{}, querySelectorAll:()=>[] }
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

const combatOverlay = stubEl();
const combatEnemies = stubEl();
const combatParty = stubEl();
const combatCmd = stubEl();
const turnIndicator = stubEl();

global.document = {
  getElementById: (id) => ({ combatOverlay, combatEnemies, combatParty, combatCmd, turnIndicator })[id] || stubEl(),
  createElement: () => stubEl()
};

global.window = global;

global.log = () => {};
global.toast = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.updateHUD = () => {};
global.player = { inv: [], hp: 10 };

global.requestAnimationFrame = () => {};

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/party.js',
  '../scripts/core/combat.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

party.length = 0;

test('flee success resolves combat', async () => {
  const hero = makeMember('h', 'Hero');
  hero.lvl = 5;
  party.push(hero);
  const enemy = { name:'Slime', hp:5, maxHp:5 };
  const p = openCombat([enemy]);
  const r = Math.random; Math.random = () => 0;
  attemptFlee();
  const res = await p;
  Math.random = r;
  assert.strictEqual(res.result, 'flee');
});

test('failed flee grants enemy attack and advances turn', () => {
  party.length = 0;
  const a = makeMember('a', 'A');
  const b = makeMember('b', 'B');
  party.push(a, b);
  a.hp = 10; b.hp = 10;
  const enemy = { name:'Goblin', hp:1, maxHp:1 };
  openCombat([enemy]);
  const r = Math.random; Math.random = () => 0.9;
  attemptFlee();
  Math.random = r;
  assert.strictEqual(a.hp, 9);
  assert.strictEqual(combatState.phase, 'party');
  assert.strictEqual(combatState.active, 1);
  closeCombat('flee');
});
