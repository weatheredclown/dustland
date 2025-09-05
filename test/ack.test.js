import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import fsSync from 'node:fs';
import { execSync } from 'node:child_process';

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
    parentElement:{ style:{}, appendChild(){}, querySelectorAll(){ return []; } },
    setAttribute(){},
    click(){},
    focus(){},
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

globalThis.party = { x: 0, y: 0 };
vm.runInThisContext('var party = globalThis.party;');

const files = [
  '../scripts/event-bus.js',
  '../scripts/core/movement.js',
  '../scripts/dustland-core.js',
  '../scripts/core/dialog.js',
  '../scripts/adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { applyLoadedModule, TILE, setTile, placeHut, genWorld, addTerrainFeature, stampWorld, worldStamps, tileEmoji, gridToEmoji, clearWorld, beginPlaceNPC, beginPlaceItem, beginPlaceBldg } = globalThis;

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
  globalThis.validateSpawns = () => [];
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

test('zones round-trip through saveModule', () => {
  applyLoadedModule({ seed: 1 });
  document.getElementById('zoneMap').value = 'world';
  document.getElementById('zoneX').value = 0;
  document.getElementById('zoneY').value = 0;
  document.getElementById('zoneW').value = 1;
  document.getElementById('zoneH').value = 1;
  addZone();
  const origValidate = globalThis.validateSpawns;
  globalThis.validateSpawns = () => [];
  let saved = '';
  const origBlob = globalThis.Blob;
  globalThis.Blob = class { constructor(parts) { this.text = parts.join(''); } };
  const origURL = global.URL;
  global.URL = { createObjectURL: blob => { saved = blob.text; return ''; }, revokeObjectURL() {} };
  const origCreate = document.createElement;
  document.createElement = tag => tag === 'a' ? { href: '', download: '', click() {} } : origCreate(tag);
  saveModule();
  const json = JSON.parse(saved);
  assert.deepStrictEqual(json.zones, [{ map: 'world', x: 0, y: 0, w: 1, h: 1 }]);
  document.createElement = origCreate;
  global.URL = origURL;
  globalThis.Blob = origBlob;
  globalThis.validateSpawns = origValidate;
});

test('playtestModule includes zones', () => {
  applyLoadedModule({ seed: 1 });
  document.getElementById('zoneMap').value = 'world';
  document.getElementById('zoneX').value = 0;
  document.getElementById('zoneY').value = 0;
  document.getElementById('zoneW').value = 1;
  document.getElementById('zoneH').value = 1;
  addZone();
  let saved = '';
  const origLS = global.localStorage;
  global.localStorage = { setItem: (k,v) => { saved = v; }, getItem: () => null, removeItem: () => {} };
  const origOpen = global.open;
  global.open = () => {};
  playtestModule();
  const json = JSON.parse(saved);
  assert.deepStrictEqual(json.zones, [{ map: 'world', x: 0, y: 0, w: 1, h: 1 }]);
  global.localStorage = origLS;
  global.open = origOpen;
});

test('custom item tags update tag options', () => {
  const dl = document.getElementById('tagOptions');
  assert.ok(dl.innerHTML.includes('value="key"'));
  moduleData.items = [];
  document.getElementById('itemName').value = 'Mystic Key';
  document.getElementById('itemId').value = 'mystic_key';
  document.getElementById('itemTags').value = 'mystic';
  addItem();
  assert.ok(dl.innerHTML.includes('value="mystic"'));
  moduleData.items = [];
});

test('can add item without map placement', () => {
  moduleData.items = [];
  startNewItem();
  document.getElementById('itemName').value = 'Reward';
  document.getElementById('itemId').value = 'reward';
  document.getElementById('itemMap').value = '';
  addItem();
  assert.strictEqual(moduleData.items.length, 1);
  assert.ok(!('map' in moduleData.items[0]));
  moduleData.items = [];
});

test('world paint persists through save/load', () => {
  genWorld(1);
  clearWorld();
  setTile('world', 0, 0, TILE.ROCK);
  const origValidate = globalThis.validateSpawns;
  globalThis.validateSpawns = () => [];
  let saved = '';
  const origBlob = globalThis.Blob;
  globalThis.Blob = class { constructor(parts) { this.text = parts.join(''); } };
  const origURL = global.URL;
  global.URL = { createObjectURL: blob => { saved = blob.text; return ''; }, revokeObjectURL() {} };
  const origCreate = document.createElement;
  document.createElement = tag => tag === 'a' ? { href: '', download: '', click() {} } : origCreate(tag);
  saveModule();
  document.createElement = origCreate;
  global.URL = origURL;
  globalThis.Blob = origBlob;
  globalThis.validateSpawns = origValidate;
  const json = JSON.parse(saved);
  const rockEmoji = tileEmoji[TILE.ROCK];
  assert.strictEqual(Array.from(json.world[0])[0], rockEmoji);
  setTile('world', 0, 0, TILE.SAND);
  applyLoadedModule(json);
  assert.strictEqual(world[0][0], TILE.ROCK);
  setTile('world', 0, 0, TILE.SAND);
});

test('world base tiles persist through save/load', () => {
  genWorld(1);
  clearWorld();
  setTile('world', 0, 0, TILE.BUILDING);
  const origValidate = globalThis.validateSpawns;
  globalThis.validateSpawns = () => [];
  let saved = '';
  const origBlob = globalThis.Blob;
  globalThis.Blob = class { constructor(parts) { this.text = parts.join(''); } };
  const origURL = global.URL;
  global.URL = { createObjectURL: blob => { saved = blob.text; return ''; }, revokeObjectURL() {} };
  const origCreate = document.createElement;
  document.createElement = tag => tag === 'a' ? { href: '', download: '', click() {} } : origCreate(tag);
  saveModule();
  document.createElement = origCreate;
  global.URL = origURL;
  globalThis.Blob = origBlob;
  globalThis.validateSpawns = origValidate;
  const json = JSON.parse(saved);
  const buildingEmoji = tileEmoji[TILE.BUILDING];
  assert.strictEqual(Array.from(json.world[0])[0], buildingEmoji);
  setTile('world', 0, 0, TILE.SAND);
  applyLoadedModule(json);
  assert.strictEqual(world[0][0], TILE.BUILDING);
  setTile('world', 0, 0, TILE.SAND);
});

test('saveModule exports buildings, interiors, and encounters without _origKeys', () => {
  const prevBldgs = moduleData.buildings;
  const prevInts = moduleData.interiors;
  const prevEnc = moduleData.encounters;
  const prevInteriorMap = interiors;
  const prevOrig = moduleData._origKeys;
  const prevWorld = world;
  genWorld(1);
  moduleData.buildings = [{ x: 1, y: 1, w: 1, h: 1 }];
  moduleData.interiors = [{ id: 'room', w: 1, h: 1, grid: [[TILE.FLOOR]] }];
  interiors = { room: moduleData.interiors[0] };
  moduleData.encounters = [{ map: 'world', templateId: 'test' }];
  delete moduleData._origKeys;
  const origValidate = globalThis.validateSpawns;
  globalThis.validateSpawns = () => [];
  let saved = '';
  const origBlob = globalThis.Blob;
  globalThis.Blob = class { constructor(parts) { this.text = parts.join(''); } };
  const origURL = global.URL;
  global.URL = { createObjectURL: blob => { saved = blob.text; return ''; }, revokeObjectURL() {} };
  const origCreate = document.createElement;
  document.createElement = tag => tag === 'a' ? { href: '', download: '', click() {} } : origCreate(tag);
  saveModule();
  document.createElement = origCreate;
  global.URL = origURL;
  globalThis.Blob = origBlob;
  globalThis.validateSpawns = origValidate;
  const json = JSON.parse(saved);
  const floorEmoji = tileEmoji[TILE.FLOOR];
  assert.deepStrictEqual(json.buildings, [{ x: 1, y: 1, w: 1, h: 1 }]);
  assert.deepStrictEqual(json.interiors, [{ id: 'room', w: 1, h: 1, grid: [floorEmoji] }]);
  assert.deepStrictEqual(json.encounters, { world: [{ templateId: 'test' }] });
  moduleData.buildings = prevBldgs;
  moduleData.interiors = prevInts;
  moduleData.encounters = prevEnc;
  interiors = prevInteriorMap;
  if (prevOrig === undefined) delete moduleData._origKeys; else moduleData._origKeys = prevOrig;
  world = prevWorld;
});

test('validateSpawns lists blocked spawns', () => {
  genWorld(1);
  setTile('world',0,0,TILE.WATER);
  moduleData.start = { map:'world', x:0, y:0 };
  moduleData.npcs = [{ id:'n1', map:'world', x:1, y:0 }];
  setTile('world',1,0,TILE.WATER);
  moduleData.items = [];
  const issues = validateSpawns();
  assert.strictEqual(issues.length,2);
  assert.strictEqual(issues[0].type,'start');
  assert.strictEqual(issues[1].type,'npc');
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

test('brushSize slider adjusts noise radius', () => {
  genWorld(1);
  for (let dy=-2; dy<=2; dy++) {
    for (let dx=-2; dx<=2; dx++) {
      setTile('world', 5+dx, 5+dy, TILE.SAND);
    }
  }
  const slider = document.getElementById('brushSize');
  slider.value = '2';
  if (slider._listeners && slider._listeners.input) slider._listeners.input[0]();
  const rnd = Math.random;
  Math.random = () => 0;
  addTerrainFeature(5,5,TILE.ROCK);
  Math.random = rnd;
  assert.strictEqual(world[3][5], TILE.ROCK);
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

test('painting interior in main window', () => {
  moduleData.interiors = [{ id:'room', w:2, h:2, grid:[[TILE.FLOOR,TILE.FLOOR],[TILE.FLOOR,TILE.FLOOR]] }];
  interiors = { room: moduleData.interiors[0] };
  showMap('room');
  worldButtons[2]._listeners.click[0]();
  canvasEl._listeners.mousedown[0]({ clientX:0, clientY:0, button:0 });
  canvasEl._listeners.mouseup[0]({ button:0 });
  assert.strictEqual(interiors.room.grid[0][0], TILE.WATER);
  showMap('world');
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

test('beginPlace* clears world palette selection', () => {
  const funcs = [beginPlaceNPC, beginPlaceItem, beginPlaceBldg];
  for (const fn of funcs) {
    worldPaint = TILE.ROCK;
    worldStamp = worldStamps.hill;
    worldButtons[1].classList.add('active');
    paletteLabel.textContent = 'Rock';
    fn();
    assert.strictEqual(worldPaint, null);
    assert.strictEqual(worldStamp, null);
    assert.ok(!worldButtons.some(b => b.classList.contains('active')));
    assert.strictEqual(paletteLabel.textContent, '');
  }
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

test('confirm modal renders after dialog modal', async () => {
  const html = await fs.readFile('adventure-kit.html', 'utf8');
  const confirmIdx = html.indexOf('id="confirmModal"');
  const dialogIdx = html.indexOf('id="dialogModal"');
  assert.ok(confirmIdx > dialogIdx);
});

test('confirm dialog supports enter/escape shortcuts', () => {
  let called = 0;
  confirmDialog('ok?', () => { called++; });
  document.body._listeners.keydown[0]({ key: 'Enter' });
  assert.strictEqual(called, 1);
  confirmDialog('ok?', () => { called++; });
  document.body._listeners.keydown[0]({ key: 'Escape' });
  assert.strictEqual(called, 1);
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

test('NPC title survives round trip', () => {
  moduleData.npcs = [{
    id: 'npc1', name: 'NPC', title: 'Trader', color: '#fff', map: 'world', x: 0, y: 0, tree: {}
  }];
  editNPC(0);
  const npc = collectNPCFromForm();
  assert.strictEqual(npc.title, 'Trader');
});

test('NPC combat fields round trip through editor', () => {
  moduleData.npcs = [{
    id: 'npc1', name: 'NPC', color: '#fff', map: 'world', x: 0, y: 0, tree: {},
    combat: {
      HP: 30,
      ATK: 3,
      DEF: 2,
      loot: 'raider_knife',
      boss: true,
      special: { cue: 'crackles with energy!', dmg: 5, delay: 1000 }
    }
  }];
  editNPC(0);
  applyNPCChanges();
  assert.deepStrictEqual(moduleData.npcs[0].combat, {
    HP: 30,
    ATK: 3,
    DEF: 2,
    loot: 'raider_knife',
    boss: true,
    special: { cue: 'crackles with energy!', dmg: 5, delay: 1000 }
  });
});

test('loadMods accepts undefined', () => {
  assert.doesNotThrow(() => loadMods(undefined));
});

test('dustland module JSON round trips through ACK', () => {
  const jsonPath = 'data/modules/dustland.json';
  try {
    execSync('node scripts/module-json.js export modules/dustland.module.js');
    const original = JSON.parse(fsSync.readFileSync(jsonPath, 'utf8'));

    const origValidate = globalThis.validateSpawns;
    globalThis.validateSpawns = () => true;

    let saved = '';
    const origBlob = globalThis.Blob;
    globalThis.Blob = class { constructor(parts) { this.text = parts.join(''); } };
    const origURL = globalThis.URL;
    globalThis.URL = {
      createObjectURL(blob) { saved = blob.text; return ''; },
      revokeObjectURL() {}
    };
    const origCreate = document.createElement;
    document.createElement = tag => {
      if (tag === 'a') return { href: '', download: '', click() {} };
      return origCreate(tag);
    };

    applyLoadedModule(original);
    saveModule();

    document.createElement = origCreate;
    globalThis.URL = origURL;
    globalThis.Blob = origBlob;
    globalThis.validateSpawns = origValidate;

    const savedObj = JSON.parse(saved);
    const expected = { ...original, world: gridToEmoji(world) };
    assert.deepStrictEqual(savedObj, expected);
  } finally {
    fsSync.rmSync(jsonPath, { force: true });
  }
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

test('closeItemEditor hides the item editor', () => {
  const prev = moduleData.items;
  moduleData.items = [{ id: 'it1', name: 'Item', map: 'world', x: 0, y: 0 }];
  editItem(0);
  closeItemEditor();
  assert.strictEqual(editItemIdx, -1);
  assert.strictEqual(document.getElementById('itemEditor').style.display, 'none');
  moduleData.items = prev;
});

test('equip editor shows only for equippable types', () => {
  const prev = moduleData.items;
  moduleData.items = [];
  startNewItem();
  const equipWrap = document.getElementById('itemEquip').parentElement;
  assert.strictEqual(equipWrap.style.display, 'none');
  document.getElementById('itemName').value = 'NoType';
  document.getElementById('itemId').value = 'notype';
  document.getElementById('itemType').value = 'consumable';
  document.getElementById('itemEquip').value = '{"msg":"hi"}';
  addItem();
  assert.strictEqual(moduleData.items[0].equip, null);

  startNewItem();
  document.getElementById('itemType').value = 'weapon';
  updateModsWrap();
  assert.strictEqual(equipWrap.style.display, 'block');
  document.getElementById('itemName').value = 'WithSlot';
  document.getElementById('itemId').value = 'withslot';
  document.getElementById('itemEquip').value = '{"msg":"hi"}';
  addItem();
  assert.deepStrictEqual(moduleData.items[1].equip, { msg: 'hi' });
  moduleData.items = prev;
});

test('closeBldgEditor hides the building editor', () => {
  const prev = moduleData.buildings;
  moduleData.buildings = [{ x: 1, y: 1, w: 1, h: 1 }];
  editBldg(0);
  closeBldgEditor();
  assert.strictEqual(editBldgIdx, -1);
  assert.strictEqual(document.getElementById('bldgEditor').style.display, 'none');
  moduleData.buildings = prev;
});

test('closeInteriorEditor hides the interior editor', () => {
  const prev = moduleData.interiors;
  moduleData.interiors = [{ id: 'int1', w: 3, h: 3, grid: Array.from({ length: 3 }, () => Array(3).fill(TILE.FLOOR)) }];
  interiors.int1 = moduleData.interiors[0];
  editInterior(0);
  closeInteriorEditor();
  assert.strictEqual(editInteriorIdx, -1);
  assert.strictEqual(document.getElementById('intEditor').style.display, 'none');
  moduleData.interiors = prev;
  delete interiors.int1;
});

test('collectNPCFromForm retains custom portrait path', () => {
  moduleData.npcs = [{
    id: 'npc1', name: 'NPC', color: '#fff', map: 'world', x: 0, y: 0,
    tree: { start: { text: 'hi', choices: [] } },
    portraitSheet: 'assets/portraits/grin_4.png'
  }];
  editNPC(0);
  const npc = collectNPCFromForm();
  assert.strictEqual(npc.portraitSheet, 'assets/portraits/grin_4.png');
});

test('building boarded state round trips through editor', () => {
  const prevModuleBldgs = moduleData.buildings;
  const prevBuilds = globalThis.buildings.slice();
  genWorld(1, { buildings: [] });
  moduleData.buildings = [];
  startNewBldg();
  document.getElementById('bldgBoarded').checked = true;
  addBuilding();
  assert.strictEqual(moduleData.buildings[0].boarded, true);
  editBldg(0);
  document.getElementById('bldgBoarded').checked = false;
  applyBldgChanges();
  assert.strictEqual(moduleData.buildings[0].boarded, false);
  moduleData.buildings = prevModuleBldgs;
  globalThis.buildings = prevBuilds;
});

test('npc locked state round trips through editor', () => {
  const prev = moduleData.npcs;
  moduleData.npcs = [];
  startNewNPC();
  document.getElementById('npcLocked').checked = true;
  addNPC();
  assert.strictEqual(moduleData.npcs[0].locked, true);
  editNPC(0);
  document.getElementById('npcLocked').checked = false;
  applyNPCChanges();
  assert.strictEqual(moduleData.npcs[0].locked, undefined);
  moduleData.npcs = prev;
});

test('locked node scaffold added and not orphaned', () => {
  startNewNPC();
  document.getElementById('npcLocked').checked = true;
  const npc = collectNPCFromForm();
  assert.ok(npc.tree.locked, 'locked node created');
  assert.ok(npc.tree.start, 'start node exists');
  assert.strictEqual(document.getElementById('treeWarning').textContent, '');
});

test('updateTreeData captures NPC lock effects', () => {
  treeData = {};
  const wrap = document.getElementById('treeEditor');
  const field = (value = '', checked = false) => ({ value, checked, style: {} });
  const choiceEl = {
    querySelector(sel) {
      if (sel === '.choiceLockNPC') return field('chest');
      if (sel === '.choiceUnlockNPC') return field('door');
      if (sel === '.choiceLabel') return field('Lock');
      if (sel === '.choiceGotoTarget') return field('player');
      if (sel === '.choiceGotoRel' || sel === '.choiceOnce' || sel === '.choiceIfOnceUsed') return field('', false);
      return field('');
    },
    querySelectorAll() { return []; }
  };
  const nodeEl = {
    classList: { contains: () => false },
    style: {},
    querySelector(sel) {
      if (sel === '.nodeId') return field('start');
      if (sel === '.nodeText') return field('hi');
      return field('');
    },
    querySelectorAll(sel) {
      if (sel === '.choices > div') return [choiceEl];
      return [];
    }
  };
  wrap.querySelectorAll = sel => sel === '.node' ? [nodeEl] : [];
  updateTreeData();
  assert.deepStrictEqual(treeData.start.choices[0].effects, [
    { effect: 'lockNPC', npcId: 'chest' },
    { effect: 'unlockNPC', npcId: 'door' }
  ]);
});

test('startSpoofPlayback shows locked node when npc locked', () => {
  globalThis.closeDialog = () => {};
  const tree = {
    locked: { text: 'locked', choices: [{ label: '(Leave)', to: 'bye' }] },
    start: { text: 'start', choices: [{ label: '(Leave)', to: 'bye' }] }
  };
  startSpoofPlayback(tree, {}, {}, true);
  assert.strictEqual(document.getElementById('dialogText').textContent, 'locked');
  stopSpoofPlayback();
});
test('updateTreeData captures NPC color effects', () => {
  treeData = {};
  const wrap = document.getElementById('treeEditor');
  const field = (value = '', checked = false) => ({ value, checked, style: {} });
  const choiceEl = {
    querySelector(sel) {
      if (sel === '.choiceColorNPC') return field('friend');
      if (sel === '.choiceNPCColor') return field('#ff0000');
      if (sel === '.choiceLabel') return field('Color');
      if (sel === '.choiceGotoTarget') return field('player');
      if (sel === '.choiceGotoRel' || sel === '.choiceOnce' || sel === '.choiceIfOnceUsed') return field('', false);
      return field('');
    },
    querySelectorAll() { return []; }
  };
  const nodeEl = {
    classList: { contains: () => false },
    style: {},
    querySelector(sel) {
      if (sel === '.nodeId') return field('start');
      if (sel === '.nodeText') return field('hi');
      return field('');
    },
    querySelectorAll(sel) {
      if (sel === '.choices > div') return [choiceEl];
      return [];
    }
  };
  wrap.querySelectorAll = sel => sel === '.node' ? [nodeEl] : [];
  updateTreeData();
  assert.deepStrictEqual(treeData.start.choices[0].effects, [
    { effect: 'npcColor', npcId: 'friend', color: '#ff0000' }
  ]);
});
