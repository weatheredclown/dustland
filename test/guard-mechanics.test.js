import assert from 'node:assert';
import { test } from 'node:test';
import './fast-timeouts.js';

function stubEl(){
  const el = {
    style: {
      display: '',
      _props: {},
      setProperty(k, v){ this._props[k] = v; },
      getPropertyValue(k){ return this._props[k] || ''; }
    },
    classList: {
      _set: new Set(),
      add(c){ this._set.add(c); },
      remove(c){ this._set.delete(c); },
      toggle(c, force){
        if (force === undefined){
          this._set.has(c) ? this._set.delete(c) : this._set.add(c);
        } else if (force){
          this._set.add(c);
        } else {
          this._set.delete(c);
        }
      },
      contains(c){ return this._set.has(c); }
    },
    textContent: '',
    onclick: null,
    children: [],
    parentElement: null,
    appendChild(child){
      this.children.push(child);
      child.parentElement = this;
      return child;
    },
    prepend(child){
      this.children.unshift(child);
      child.parentElement = this;
      return child;
    },
    querySelector(){ return stubEl(); },
    querySelectorAll(){ return []; },
    addEventListener(){},
    removeEventListener(){},
    setAttribute(){},
    getBoundingClientRect(){ return { x:0, y:0, width:0, height:0 }; }
  };
  Object.defineProperty(el, 'innerHTML', {
    get(){ return this._innerHTML || ''; },
    set(v){ this._innerHTML = v; this.children = []; }
  });
  return el;
}

const combatOverlay = stubEl();
const combatEnemies = stubEl();
const combatParty = stubEl();
const combatCmd = stubEl();
const turnIndicator = stubEl();

global.document = {
  getElementById: (id) => ({
    combatOverlay,
    combatEnemies,
    combatParty,
    combatCmd,
    turnIndicator
  })[id] || stubEl(),
  createElement: () => stubEl()
};

global.window = global;
global.window.addEventListener = () => {};

global.log = () => {};
global.toast = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.updateHUD = () => {};
global.player = { inv: [], hp: 10 };

global.EventBus = { emit: () => {}, on: () => {} };

await import('../scripts/core/party.js');
await import('../scripts/core/combat.js');

const { party, makeMember, openCombat, closeCombat, __combatState, __enemyAttack, __enterGuardStance } = globalThis;

test('guard stance scales with level', () => {
  const novice = makeMember('novice', 'Novice', 'Scout');
  const veteran = makeMember('veteran', 'Veteran', 'Scout');
  novice.lvl = 1;
  veteran.lvl = 10;

  const noviceGuard = __enterGuardStance(novice);
  const veteranGuard = __enterGuardStance(veteran);

  assert.ok(veteranGuard > noviceGuard);
});

test('guard overflow reflects damage to the attacker', async () => {
  party.length = 0;
  const hero = makeMember('hero', 'Hero', 'Scout');
  hero.lvl = 4;
  hero.maxHp = 12;
  hero.hp = hero.maxHp;
  party.push(hero);

  const enemy = { name: 'Raider', hp: 5, maxHp: 5, ATK: 4 };
  const combatPromise = openCombat([enemy]);

  __enterGuardStance(hero);
  __combatState.phase = 'enemy';
  __combatState.active = 0;

  const rand = Math.random;
  Math.random = () => 0;
  __enemyAttack();
  Math.random = rand;

  assert.strictEqual(hero.hp, hero.maxHp);
  assert.strictEqual(__combatState.enemies[0].hp, 4);

  closeCombat('flee');
  await combatPromise;
});

test('guard reflection can defeat an attacker', async () => {
  party.length = 0;
  const hero = makeMember('guardian', 'Guardian', 'Sentinel');
  hero.lvl = 10;
  hero.maxHp = 18;
  hero.hp = hero.maxHp;
  party.push(hero);

  const enemy = { name: 'Shade', hp: 3, maxHp: 3, ATK: 3 };
  const combatPromise = openCombat([enemy]);

  __enterGuardStance(hero);
  __combatState.phase = 'enemy';
  __combatState.active = 0;

  const rand = Math.random;
  Math.random = () => 0;
  __enemyAttack();
  Math.random = rand;

  const result = await combatPromise;
  assert.strictEqual(result.result, 'loot');
  assert.strictEqual(party.length, 1);
});
