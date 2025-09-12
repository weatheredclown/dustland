import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    style:{},
    classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    textContent:'',
    onclick:null,
    children:[],
    dataset:{},
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getContext: () => ({
      clearRect(){}, drawImage(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){},
      save(){}, restore(){}, translate(){}, font:'', fillText(){}, globalAlpha:1
    }),
    addEventListener(){},
    remove(){},
    parentElement:{ appendChild(){}, querySelectorAll(){ return []; } }
  };
  return el;
}

global.requestAnimationFrame = () => {};
Object.assign(global, {
  window: global,
  innerWidth: 800,
  innerHeight: 600,
  addEventListener(){},
  localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
  location: { href: '' }
});

global.document = {
  body: stubEl(),
  head: stubEl(),
  createElement: () => stubEl(),
  getElementById: () => stubEl(),
  querySelector: () => stubEl()
};

global.log = () => {};
global.toast = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.renderQuests = () => {};
global.updateHUD = () => {};
global.centerCamera = () => {};

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/actions.js',
  '../scripts/core/effects.js',
  '../scripts/core/spoils-cache.js',
  '../scripts/core/abilities.js',
  '../scripts/core/party.js',
  '../scripts/core/inventory.js',
  '../scripts/core/movement.js',
  '../scripts/core/dialog.js',
  '../scripts/core/combat.js',
  '../scripts/core/quests.js',
  '../scripts/core/npc.js',
  '../scripts/game-state.js',
  '../scripts/dustland-core.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

test('load() resets invalid position to world', () => {
  const save = {
    worldSeed: 1,
    world: [[0]],
    player: {},
    state: { map: 'void' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [],
    quests: {},
    party: [{ id: 'p', name: 'P', role: 'lead', lvl:1, xp:0, skillPoints:0, stats:{}, equip:{}, hp:10, map:'void', x:5, y:5, maxHp:10 }]
  };
  global.localStorage.getItem = () => JSON.stringify(save);
  load();
  assert.strictEqual(state.map, 'world');
  assert.strictEqual(party.map, 'world');
});

