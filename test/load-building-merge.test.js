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

function makeWorld(width, height, fill){
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

test('mergeBuildingState preserves module door positions', () => {
  const TILE = global.TILE;
  const moduleBuilding = {
    x: 10,
    y: 10,
    grid: [
      [TILE.BUILDING, TILE.BUILDING, TILE.BUILDING],
      [TILE.BUILDING, TILE.BUILDING, TILE.BUILDING],
      [TILE.BUILDING, TILE.DOOR, TILE.BUILDING]
    ],
    interiorId: 'hut',
    boarded: false
  };
  const moduleData = {
    seed: 1,
    world: makeWorld(20, 20, TILE.SAND),
    buildings: [moduleBuilding],
    interiors: [
      { id: 'hut', grid: [
        [TILE.FLOOR, TILE.FLOOR, TILE.FLOOR],
        [TILE.FLOOR, TILE.FLOOR, TILE.FLOOR],
        [TILE.FLOOR, TILE.DOOR, TILE.FLOOR]
      ] }
    ]
  };
  applyModule(moduleData, { fullReset: true });
  const target = buildings.find(b => b.interiorId === 'hut');
  assert.ok(target);
  assert.strictEqual(target.doorX, 11);
  assert.strictEqual(target.doorY, 12);
  const savedBuilding = {
    x: 10,
    y: 10,
    w: 3,
    h: 3,
    doorX: 11,
    doorY: 11,
    interiorId: 'hut',
    grid: [
      [TILE.BUILDING, TILE.BUILDING, TILE.BUILDING],
      [TILE.BUILDING, TILE.DOOR, TILE.BUILDING],
      [TILE.BUILDING, TILE.BUILDING, TILE.BUILDING]
    ],
    boarded: true
  };
  mergeBuildingState([savedBuilding]);
  const merged = buildings.find(b => b.interiorId === 'hut');
  assert.ok(merged);
  assert.strictEqual(merged.doorX, 11);
  assert.strictEqual(merged.doorY, 12);
  assert.strictEqual(merged.boarded, true);
});
