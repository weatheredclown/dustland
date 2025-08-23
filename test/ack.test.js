import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    style:{},
    classList:{ _set:new Set(), toggle(c){this._set.has(c)?this._set.delete(c):this._set.add(c);}, add(c){this._set.add(c);}, remove(c){this._set.delete(c);}, contains(c){return this._set.has(c);}},
    textContent:'',
    onclick:null,
    value:'',
    _innerHTML:'',
    children:[],
    width:0,
    height:0,
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left:0, top:0 }),
    getContext: () => ({
      clearRect(){}, drawImage(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, strokeRect(){},
      save(){}, restore(){}, translate(){}, font:'', fillText(){}, globalAlpha:1
    }),
    addEventListener(type, fn){
      this._listeners = this._listeners || {};
      (this._listeners[type] = this._listeners[type] || []).push(fn);
    },
    removeEventListener(type, fn){
      if (!this._listeners || !this._listeners[type]) return;
      this._listeners[type] = this._listeners[type].filter(f => f !== fn);
    },
    parentElement:{ appendChild(){}, querySelectorAll(){ return []; } },
    setAttribute(){},
    click(){},
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

global.requestAnimationFrame = () => {};
global.alert = () => {};
global.confirm = () => true;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = global;
window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
const bodyEl = stubEl();
const canvasEl = stubEl();
canvasEl.width = 120;
canvasEl.height = 90;
const moduleNameInput = stubEl();
const paletteLabel = stubEl();
const worldButtons = Array.from({ length: 3 }, (_, i) => {
  const b = stubEl();
  b.dataset = { tile: String(i) };
  return b;
});
const worldPalette = stubEl();
worldPalette.querySelectorAll = () => worldButtons;
const elements = { map: canvasEl, moduleName: moduleNameInput, worldPalette, paletteLabel };
global.document = {
  body: bodyEl,
  getElementById: id => elements[id] || (elements[id] = stubEl()),
  createElement: () => stubEl(),
  querySelector: () => stubEl(),
  querySelectorAll: () => []
};

const files = [
  '../event-bus.js',
  '../core/movement.js',
  '../dustland-core.js',
  '../adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { applyLoadedModule, TILE, setTile, placeHut, genWorld, addTerrainFeature } = globalThis;

test('applyLoadedModule clears previous building tiles', () => {
  genWorld(123);
  globalThis.buildings.forEach(b => {
    for (let y=0; y<b.h; y++) {
      for (let x=0; x<b.w; x++) {
        setTile('world', b.x + x, b.y + y, b.under[y][x]);
      }
    }
  });
  globalThis.buildings.length = 0;
  placeHut(1,1);
  assert.strictEqual(world[1][1], TILE.BUILDING);
  applyLoadedModule({ seed: 123, buildings: [] });
  assert.notStrictEqual(world[1][1], TILE.BUILDING);
  assert.strictEqual(globalThis.buildings.length, 0);
});

test('saveModule uses module name for download', () => {
  const origValidateSpawns = globalThis.validateSpawns;
  globalThis.validateSpawns = () => true;
  moduleNameInput.value = 'custom-name';
  const aEl = stubEl();
  const origCreate = document.createElement;
  document.createElement = tag => tag === 'a' ? aEl : origCreate(tag);
  const origURL = global.URL;
  global.URL = { createObjectURL: () => 'u', revokeObjectURL: () => {} };
  saveModule();
  assert.strictEqual(aEl.download, 'custom-name.json');
  document.createElement = origCreate;
  global.URL = origURL;
  globalThis.validateSpawns = origValidateSpawns;
});

test('addTerrainFeature sprinkles noise', () => {
  genWorld(1);
  for (let dy=-1; dy<=1; dy++) {
    for (let dx=-1; dx<=1; dx++) {
      setTile('world', 5+dx, 5+dy, TILE.SAND);
    }
  }
  const prev = world[4][5];
  const rnd = Math.random;
  Math.random = () => 0;
  addTerrainFeature(5,5,TILE.ROCK);
  Math.random = rnd;
  assert.strictEqual(world[5][5], TILE.ROCK);
  assert.strictEqual(world[4][5], TILE.ROCK);
  assert.strictEqual(prev, TILE.SAND);
});

test('dragging building ignores paint', () => {
  genWorld(1);
  moduleData.buildings = [{ x:5, y:5, w:1, h:1 }];
  setTile('world',5,5,TILE.BUILDING);
  worldPaint = TILE.ROCK;
  const before = world[5][5];
  canvasEl._listeners.mousedown[0]({ clientX:5, clientY:5, button:0 });
  assert.strictEqual(world[5][5], before);
  assert.strictEqual(worldPainting, false);
});

test('select on map does not paint', () => {
  genWorld(1);
  worldPaint = TILE.ROCK;
  const before = world[2][3];
  setCoordTarget({ x: 'eventX', y: 'eventY' });
  canvasEl._listeners.mousedown[0]({ clientX:3, clientY:2, button:0  });
  assert.strictEqual(world[2][3], before);
  assert.strictEqual(worldPainting, false);
});

test('clicking building while paint palette active still edits', () => {
  genWorld(1);
  moduleData.buildings = [{ x:5, y:5, w:1, h:1 }];
  setTile('world',5,5,TILE.BUILDING);
  worldPaint = TILE.ROCK;
  let edited = false;
  const orig = globalThis.editBldg;
  globalThis.editBldg = () => { edited = true; };
  canvasEl._listeners.mousedown[0]({ clientX:5, clientY:5, button:0 });
  canvasEl._listeners.mouseup[0]({ button:0 });
  canvasEl._listeners.click[0]({ clientX:5, clientY:5, button:0 });
  globalThis.editBldg = orig;
  assert.strictEqual(edited, true);
});

test('painting then leaving map keeps next click', () => {
  genWorld(1);
  moduleData.buildings = [{ x:5, y:5, w:1, h:1 }];
  setTile('world',5,5,TILE.BUILDING);
  worldPaint = TILE.ROCK;
  canvasEl._listeners.mousedown[0]({ clientX:0, clientY:0, button:0 });
  canvasEl._listeners.mouseleave[0]({});
  let edited = false;
  const orig = globalThis.editBldg;
  globalThis.editBldg = () => { edited = true; };
  canvasEl._listeners.mousedown[0]({ clientX:5, clientY:5, button:0 });
  canvasEl._listeners.mouseup[0]({ button:0 });
  canvasEl._listeners.click[0]({ clientX:5, clientY:5, button:0 });
  globalThis.editBldg = orig;
  assert.strictEqual(edited, true);
});

test('painting over building restores tiles', () => {
  genWorld(1);
  moduleData.buildings = [{ x:5, y:5, w:1, h:1 }];
  setTile('world',5,5,TILE.BUILDING);
  worldPaint = TILE.ROCK;
  canvasEl._listeners.mousedown[0]({ clientX:0, clientY:0, button:0 });
  canvasEl._listeners.mousemove[0]({ clientX:5, clientY:5 });
  canvasEl._listeners.mouseup[0]({ button:0 });
  assert.strictEqual(world[5][5], TILE.BUILDING);
});

test('regenWorld creates empty map without buildings', () => {
  regenWorld();
  assert.strictEqual(globalThis.buildings.length, 0);
  assert.ok(world.every(row => row.every(t => t !== TILE.BUILDING)));
});

test('world palette selection stays highlighted and labels color', () => {
  genWorld(1);
  const btn = worldButtons[1];
  btn._listeners.click[0]();
  assert.strictEqual(btn.classList.contains('active'), true);
  assert.strictEqual(paletteLabel.textContent, 'Rock');
  canvasEl._listeners.mousedown[0]({ clientX:0, clientY:0, button:0 });
  canvasEl._listeners.mouseup[0]({ button:0 });
  assert.strictEqual(btn.classList.contains('active'), true);
});

test('clearWorld wipes tiles and data', () => {
  genWorld(1, { buildings: [] });
  moduleData.npcs = [{ id:'n1', map:'world', x:0, y:0 }];
  setTile('world',0,0,TILE.BUILDING);
  globalThis.buildings.push({ x:0, y:0, w:1, h:1, under:[[TILE.SAND]] });
  clearWorld();
  document.getElementById('confirmYes').onclick();
  assert.strictEqual(world[0][0], TILE.SAND);
  assert.strictEqual(moduleData.npcs.length, 0);
  assert.strictEqual(globalThis.buildings.length, 0);
});

test('renderDialogPreview clears when no start node', () => {
  const treeEl = document.getElementById('npcTree');
  const prevEl = document.getElementById('dialogPreview');
  treeEl.value = JSON.stringify({ start: { text: 'hi', choices: [] } });
  renderDialogPreview();
  assert.ok(prevEl.innerHTML.includes('hi'));
  treeEl.value = '{}';
  renderDialogPreview();
  assert.strictEqual(prevEl.innerHTML, '');
});

test('closing dialog editor persists dialog changes', () => {
  moduleData.npcs = [{
    id: 'npc1', name: 'NPC', color: '#fff', map: 'world', x: 0, y: 0,
    tree: { start: { text: 'hi', choices: [{ label: '(Leave)', to: 'bye' }] } }
  }];
  editNPC(0);
  const newTree = { start: { text: 'bye', choices: [{ label: '(Leave)', to: 'bye' }] } };
  document.getElementById('npcTree').value = JSON.stringify(newTree);
  document.getElementById('npcDialog').value = 'bye';
  const origUpdate = globalThis.updateTreeData;
  globalThis.updateTreeData = () => {};
  closeDialogEditor();
  globalThis.updateTreeData = origUpdate;
  closeNPCEditor();
  assert.strictEqual(moduleData.npcs[0].tree.start.text, 'bye');
});

test('dialog text edited in tree editor is preserved', () => {
  moduleData.npcs = [{
    id: 'npc1', name: 'NPC', color: '#fff', map: 'world', x: 0, y: 0,
    tree: { start: { text: 'hi', choices: [{ label: '(Leave)', to: 'bye' }] } }
  }];
  editNPC(0);
  const newTree = { start: { text: 'welcome', choices: [{ label: '(Leave)', to: 'bye' }] } };
  treeData = newTree;
  document.getElementById('npcTree').value = JSON.stringify(newTree);
  document.getElementById('npcDialog').value = '';
  const origUpdate = globalThis.updateTreeData;
  globalThis.updateTreeData = () => {};
  closeDialogEditor();
  globalThis.updateTreeData = origUpdate;
  closeNPCEditor();
  assert.strictEqual(moduleData.npcs[0].tree.start.text, 'welcome');
});
