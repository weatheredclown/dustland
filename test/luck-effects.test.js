import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import './fast-timeouts.js';

function stubEl(){
  const el = {
    style:{},
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
global.logMessages = [];
global.log = (m) => logMessages.push(m);
global.toast = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.updateHUD = () => {};
global.player = { inv: [], hp: 10 };

global.requestAnimationFrame = () => {};

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/party.js',
  '../scripts/core/inventory.js',
  '../scripts/core/combat.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

party.length = 0;
const hero = makeMember('h', 'Hero');
hero.stats.LCK = 10;
hero.maxHp = 20;
hero.hp = 5;
party.push(hero);
selectedMember = 0;

test('luck boosts healing potions', () => {
  logMessages.length = 0;
  player.inv = [{ id:'pot', name:'Potion', use:{ type:'heal', amount:5 } }];
  useItem(0);
  assert.strictEqual(hero.hp, 11);
  assert.ok(logMessages.some(m => m.includes('Luck')));
});

test('luck can boost damage dealt', () => {
  logMessages.length = 0;
  hero.hp = hero.maxHp;
  const enemy = { name:'Slime', hp:10, maxHp:10 };
  const r = Math.random; Math.random = () => 0;
  openCombat([enemy]);
  doAttack(1);
  Math.random = r;
  assert.strictEqual(combatState.enemies[0].hp, 8);
  assert.ok(logMessages.some(m => m.includes('Luck')));
  closeCombat('flee');
});

test('luck can reduce damage taken', () => {
  logMessages.length = 0;
  hero.hp = 10;
  const enemy = { name:'Bat', hp:1, maxHp:1 };
  openCombat([enemy]);
  const r = Math.random; Math.random = () => 0;
  enemyAttack();
  Math.random = r;
  assert.strictEqual(hero.hp, 10);
  assert.ok(logMessages.some(m => m.includes('Luck')));
  closeCombat('flee');
});
