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
    getBoundingClientRect: () => ({ left:0, top:0, bottom:0 }),
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

global.NanoPalette = {
  init: () => {},
  generate: async () => Array(16).fill('🏝'.repeat(16)),
  enabled: true
};

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/movement.js',
  '../scripts/dustland-core.js',
  '../scripts/adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { applyLoadedModule, TILE, setTile, placeHut, genWorld, addTerrainFeature, stampWorld, worldStamps, tileEmoji, gridToEmoji } = globalThis;

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

test('applyLoadedModule avoids duplicate buildings', () => {
  genWorld(1);
  const data = { seed: 1, buildings: [{ x:2, y:2, w:2, h:2 }] };
  applyLoadedModule(data);
  assert.strictEqual(globalThis.buildings.length, 1);
  const saved = { seed: moduleData.seed, buildings: moduleData.buildings };
  applyLoadedModule(saved);
  assert.strictEqual(globalThis.buildings.length, 1);
  applyLoadedModule({ seed: 1, buildings: [] });
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

test('stampWorld applies a stamp pattern', () => {
  genWorld(1);
  const stamp = worldStamps.cross;
  stampWorld(0,0,stamp);
  assert.strictEqual(world[7][0], TILE.ROAD);
  assert.strictEqual(world[0][7], TILE.ROAD);
  assert.strictEqual(world[0][0], TILE.SAND);
});

test('hill stamp emits 16x16 emoji grid', () => {
  const block = gridToEmoji(worldStamps.hill);
  assert.strictEqual(block.length, 16);
  block.forEach(r => assert.strictEqual(Array.from(r).length, 16));
  assert.strictEqual(Array.from(block[8])[8], tileEmoji[TILE.ROCK]);
});

test('stamps window selects a world stamp', () => {
  genWorld(1);
  const first = Object.keys(worldStamps)[0];
  const btn = document.getElementById('stampsBtn');
  btn._listeners.click[0]();
  const win = document.getElementById('stampWindow');
  assert.strictEqual(win.style.display, 'block');
  const opt = win.children[0];
  opt._listeners.click[0]();
  assert.strictEqual(worldStamp, worldStamps[first]);
  assert.notStrictEqual(document.getElementById('paletteLabel').textContent, '');
  assert.strictEqual(win.style.display, 'none');
  worldStamp = null;
});

test('stamps window positions near button', () => {
  genWorld(1);
  const btn = document.getElementById('stampsBtn');
  btn._listeners.click[0]();
  const win = document.getElementById('stampWindow');
  assert.notStrictEqual(win.style.left, '');
  assert.notStrictEqual(win.style.top, '');
  win.style.display = 'none';
});

test('nano button generates a stamp', async () => {
  genWorld(1);
  const btn = document.getElementById('stampsBtn');
  btn._listeners.click[0]();
  const win = document.getElementById('stampWindow');
  const nanoBtn = win.children[win.children.length - 1];
  let called = 0;
  NanoPalette.generate = async () => { called++; return Array(16).fill('🏝'.repeat(16)); };
  await nanoBtn._listeners.click[0]();
  assert.strictEqual(called, 1);
  assert.ok(Array.isArray(worldStamp) && worldStamp.length === 16);
  worldStamp = null;
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

test('node delete uses confirm dialog', () => {
  treeData = { start: { text: '', choices: [] } };
  const wrap = document.getElementById('treeEditor');
  wrap.innerHTML = '';
  const origCreate = document.createElement;
  const origUpdate = globalThis.updateTreeData;
  globalThis.updateTreeData = () => {};
  let delBtn;
  document.createElement = tag => {
    if (tag === 'div') {
      const el = stubEl();
      const del = stubEl();
      const toggle = stubEl();
      const choices = stubEl();
      const addChoice = stubEl();
      const nodeId = stubEl();
      const nodeText = stubEl();
      const nodeBoard = stubEl();
      const nodeUnboard = stubEl();
      el.remove = () => {};
      el.querySelector = sel => {
        if (sel === '.nodeId') return nodeId;
        if (sel === '.nodeText') return nodeText;
        if (sel === '.nodeBoard') return nodeBoard;
        if (sel === '.nodeUnboard') return nodeUnboard;
        if (sel === '.choices') return choices;
        if (sel === '.addChoice') return addChoice;
        if (sel === '.toggle') return toggle;
        if (sel === '.delNode') return del;
        return stubEl();
      };
      el.querySelectorAll = () => [];
      delBtn = del;
      return el;
    }
    return origCreate(tag);
  };
  let confirmed = false;
  const origConfirm = globalThis.confirmDialog;
  globalThis.confirmDialog = (msg, onYes) => { confirmed = true; onYes(); };
  renderTreeEditor();
  delBtn._listeners.click[0]();
  assert.ok(confirmed);
  document.createElement = origCreate;
  globalThis.confirmDialog = origConfirm;
  globalThis.updateTreeData = origUpdate;
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

test('editNPC expands short hex colors', () => {
  moduleData.npcs = [{ id: 'npc1', name: 'NPC', color: '#f33', map: 'world', x: 0, y: 0, tree: {} }];
  editNPC(0);
  assert.strictEqual(document.getElementById('npcColor').value, '#ff3333');
});

test('NPC symbol is saved and restored', () => {
  moduleData.npcs = [];
  startNewNPC();
  const symbolEl = document.getElementById('npcSymbol');
  symbolEl.value = '?';
  const npc = collectNPCFromForm();
  assert.strictEqual(npc.symbol, '?');
  moduleData.npcs = [npc];
  editNPC(0);
  assert.strictEqual(document.getElementById('npcSymbol').value, '?');
});

test('loadMods accepts undefined', () => {
  assert.doesNotThrow(() => loadMods(undefined));
});

test('editing NPC centers map on its position', () => {
  const prev = moduleData.npcs;
  moduleData.npcs = [{ id: 'npc1', name: 'NPC', map: 'world', x: 80, y: 60, tree: {} }];
  worldZoom = 3;
  panX = 0;
  panY = 0;
  editNPC(0);
  assert.strictEqual(panX, 60);
  assert.strictEqual(panY, 45);
  moduleData.npcs = prev;
  worldZoom = 1;
  panX = 0;
  panY = 0;
});

test('editing item centers map on its position', () => {
  const prev = moduleData.items;
  moduleData.items = [{ id: 'it1', name: 'Item', map: 'world', x: 70, y: 10 }];
  worldZoom = 3;
  panX = 0;
  panY = 0;
  editItem(0);
  assert.strictEqual(panX, 50);
  assert.strictEqual(panY, 0);
  moduleData.items = prev;
  worldZoom = 1;
  panX = 0;
  panY = 0;
});

test('editing building centers map on its position', () => {
  const prev = moduleData.buildings;
  moduleData.buildings = [{ x: 30, y: 30, w: 10, h: 10 }];
  worldZoom = 3;
  panX = 0;
  panY = 0;
  editBldg(0);
  assert.strictEqual(panX, 15);
  assert.strictEqual(panY, 20);
  moduleData.buildings = prev;
  worldZoom = 1;
  panX = 0;
  panY = 0;
});
