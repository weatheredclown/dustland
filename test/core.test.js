import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

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
    width:0,
    height:0,
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
    parentElement:{ appendChild:()=>{}, querySelectorAll:()=>[] }
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

class AudioCtxStub {
  createOscillator(){ return { type:'', frequency:{ value:0 }, connect(){}, start(){}, stop(){} }; }
  createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){} } }; }
  get destination(){ return {}; }
}

global.requestAnimationFrame = () => {};
Object.assign(global, {
  addEventListener: () => {},
  innerWidth: 800,
  AudioContext: AudioCtxStub,
  webkitAudioContext: AudioCtxStub
});
global.window = global;
global.location = { hash: '' };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const overlay = stubEl();
const choicesEl = stubEl();
const dialogText = stubEl();
const npcName = stubEl();
const npcTitle = stubEl();
const portEl = stubEl();
const combatOverlay = stubEl();
const combatEnemies = stubEl();
const combatParty = stubEl();
let combatClickHandler = null;
const combatCmd = stubEl();
combatCmd.addEventListener = (ev, fn) => {
  if (ev === 'click') combatClickHandler = fn;
};
const turnIndicator = stubEl();
const bodyEl = stubEl();
global.document = {
  body: bodyEl,
  getElementById: (id) => ({
    overlay,
    choices: choicesEl,
    dialogText,
    npcName,
    npcTitle,
    port: portEl,
    combatOverlay,
    combatEnemies,
    combatParty,
    combatCmd,
    turnIndicator
  })[id] || stubEl(),
  createElement: () => stubEl(),
  querySelector: () => stubEl()
};

// Stub globals used during module evaluation
global.log = () => {};
global.toast = () => {};
global.sfxTick = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.renderQuests = () => {};
global.updateHUD = () => {};
global.centerCamera = () => {};
delete global.navigator;

const files = [
  '../event-bus.js',
  '../core/actions.js',
  '../core/effects.js',
  '../core/spoils-cache.js',
  '../core/party.js',
  '../core/inventory.js',
  '../core/movement.js',
  '../core/dialog.js',
  '../core/combat.js',
  '../core/quests.js',
  '../core/npc.js',
  '../dustland-core.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { clamp, createRNG, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog, applyModule, createNpcFactory, openDialog, closeDialog, NPCS, itemDrops, setLeader, resolveCheck, queryTile, interactAt, registerItem, getItem, setRNGSeed, useItem, registerTileEvents, buffs, handleDialogKey, worldFlags, makeNPC, Effects, openCombat, handleCombatKey, uncurseItem, save, makeInteriorRoom, placeHut, TILE, getTile, healParty, buildings, world } = globalThis;
const { findFreeDropTile, canWalk, move, calcMoveDelay, getMoveDelay } = globalThis.Dustland.movement;
let interiors = globalThis.interiors;

// Stub out globals used by equipment functions
global.log = () => {};
global.toast = () => {};
global.sfxTick = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
global.renderQuests = () => {};
global.updateHUD = () => {};
global.centerCamera = () => {};

test('clamp restricts values to range', () => {
  assert.strictEqual(clamp(5, 0, 10), 5);
  assert.strictEqual(clamp(-1, 0, 10), 0);
  assert.strictEqual(clamp(15, 0, 10), 10);
});

test('createRNG produces deterministic sequences', () => {
  const rngA = createRNG(123);
  const rngB = createRNG(123);
  assert.strictEqual(rngA(), rngB());
  assert.strictEqual(rngA(), rngB());
});

  test('resolveCheck uses rng and runs effects', () => {
    const actor = new Character('t','Tester','Role');
    const events = [];
    const check = { stat:'CHA', dc:5, onSuccess:[()=>events.push('s')], onFail:[()=>events.push('f')] };
    const failRes = resolveCheck(check, actor, () => 0);
    assert.strictEqual(failRes.success, false);
    assert.deepStrictEqual(events, ['f']);
    events.length = 0;
    const winRes = resolveCheck(check, actor, () => 0.99);
    assert.strictEqual(winRes.success, true);
    assert.deepStrictEqual(events, ['s']);
  });

  test('addToInv accepts item ids', () => {
    player.inv.length = 0;
    party.length = 0;
    party.addMember(new Character('t', 'T', 't'));
    registerItem({ id:'apple', name:'Apple' });
    addToInv('apple');
    assert.ok(player.inv.some(it=>it.id==='apple'));
  });

  test('picking up an item logs once', () => {
    player.inv.length = 0;
    party.length = 0;
    party.addMember(new Character('t', 'T', 't'));
    const oldLog = global.log;
    const logs = [];
    global.log = (msg) => logs.push(msg);
    registerItem({ id: 'stone', name: 'Stone' });
    addToInv('stone');
    assert.deepStrictEqual(logs, ['Picked up Stone']);
    global.log = oldLog;
  });

test('cursed items reveal on unequip attempt and stay equipped', () => {
  party.length = 0;
  player.inv.length = 0;
  const mem = new Character('t1','Tester','Role');
  party.addMember(mem);
  const cursed = normalizeItem({ id:'mask', name:'Mask', type:'armor', slot:'armor', cursed:true });
  addToInv(cursed);
  equipItem(0,0);
  assert.strictEqual(mem.equip.armor.name,'Mask');
  unequipItem(0,'armor');
  assert.ok(mem.equip.armor.cursed);
  assert.ok(mem.equip.armor.cursedKnown);
  assert.strictEqual(mem.equip.armor.name,'Mask');
});

test('uncursed gear can be removed and triggers unequip effects', () => {
  party.length = 0;
  player.inv.length = 0;
  state.map = 'world';
  const mem = new Character('t1','Tester','Role');
  party.addMember(mem);
  const helm = normalizeItem({
    id: 'helm',
    name: 'Helm',
    type: 'armor',
    slot: 'armor',
    cursed: true,
    unequip: { teleport: { map: 'office', x: 1, y: 1 }, msg: 'back' }
  });
  addToInv(helm);
  equipItem(0,0);
  unequipItem(0,'armor');
  assert.ok(mem.equip.armor); // still cursed
  uncurseItem('helm');
  unequipItem(0,'armor');
  assert.strictEqual(mem.equip.armor, null);
  assert.strictEqual(state.map, 'office');
});

test('equipping teleport item moves party and logs message', () => {
  const oldLog = global.log;
  const oldCenter = global.centerCamera;
  const logs = [];
  let centered = null;
  global.log = (msg) => logs.push(msg);
  global.centerCamera = (x, y, map) => { centered = { x, y, map }; };

  party.length = 0;
  player.inv.length = 0;
  state.map = 'world';
  party.x = 0; party.y = 0;
  const mem = new Character('t2','Tele','Role');
  party.addMember(mem);
  const tp = normalizeItem({ id:'warp_ring', name:'Warp Ring', type:'trinket', slot:'trinket', equip:{ teleport:{ map:'world', x:5, y:6 }, msg:'whoosh' } });
  addToInv(tp);
  equipItem(0,0);
  assert.strictEqual(party.x,5);
  assert.strictEqual(party.y,6);
  assert.strictEqual(state.map,'world');
  assert.deepStrictEqual(centered,{x:5,y:6,map:'world'});
  assert.ok(logs.includes('whoosh'));

  global.log = oldLog;
  global.centerCamera = oldCenter;
});

test('pathfinding blocks on NPCs', () => {
  const W=120, H=90;
  const world = Array.from({length:H},()=>Array.from({length:W},()=>7));
  applyModule({world, npcs:[{id:'g', map:'world', x:1, y:0, name:'Guard'}]});
  state.map='world';
  party.x=0; party.y=0;
  assert.strictEqual(canWalk(1,0), false);
  move(1,0);
  assert.strictEqual(party.x,0);
});

test('applyModule parses emoji world grid', () => {
  const worldRows = ['\u{1F3DD}\u{1FAA8}', '\u{1F30A}\u{1F33F}'];
  applyModule({world: worldRows});
  assert.strictEqual(world[0][0], TILE.SAND);
  assert.strictEqual(world[0][1], TILE.ROCK);
  assert.strictEqual(world[1][0], TILE.WATER);
  assert.strictEqual(world[1][1], TILE.BRUSH);
});

test('applyModule assigns NPC loops', () => {
  const world = [[7,7]];
  applyModule({world, npcs:[{id:'n', map:'world', x:0, y:0, loop:[{x:0,y:0},{x:1,y:0}]}]});
  assert.deepStrictEqual(NPCS[0].loop, [{x:0,y:0},{x:1,y:0}]);
});

test('applyModule reports successful load', () => {
  const logs = [];
  const origLog = global.log;
  const origDispatch = global.document.dispatchEvent;
  const events = [];
  global.log = m => logs.push(m);
  global.document.dispatchEvent = e => events.push(e.type);
  applyModule({ world: [[7]], name: 'testmod' });
  global.log = origLog;
  global.document.dispatchEvent = origDispatch;
  assert.ok(logs.some(l => /loaded successfully/i.test(l)));
  assert.ok(events.includes('moduleLoaded'));
});

test('applyModule removes random huts when module supplies buildings', () => {
  world.length = 0;
  for (let y = 0; y < 10; y++) world.push(Array(10).fill(TILE.SAND));
  buildings.length = 0;
  placeHut(3, 3);
  const prev = buildings.map(b => ({ x: b.x, y: b.y }));
  applyModule({ seed: 42, buildings: [{ x: 1, y: 1, w: 1, h: 2 }] });
  prev.forEach(p => {
    assert.notStrictEqual(getTile('world', p.x, p.y), TILE.BUILDING);
  });
  assert.strictEqual(getTile('world', 1, 1), TILE.BUILDING);
  assert.strictEqual(buildings.length, 1);
});

test('walking regenerates leader HP', async () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.length = 0; player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.hp = 5; hero.maxHp = 10;
  party.addMember(hero);
  party.x = 0; party.y = 0;

  await move(1,0);
  assert.strictEqual(hero.hp, 6);
  assert.strictEqual(player.hp, 6);

  hero.hp = 9; player.hp = 9;
  await move(1,0);
  assert.strictEqual(hero.hp, 10);
  assert.strictEqual(player.hp, 10);

  await move(1,0);
  assert.strictEqual(hero.hp, 10);
  assert.strictEqual(player.hp, 10);
});

test('movement delay improves with agility and equipment', async () => {
  const world = Array.from({ length:5 }, () => Array.from({ length:5 }, () => 7));
  applyModule({ world });
  state.map = 'world';
  party.length = 0;
  player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.stats.AGI = 4;
  party.addMember(hero);
  party.x = 0; party.y = 0;

  const firstMove = move(1,0);
  const baseDelay = getMoveDelay();
  await firstMove;

  addToInv({ id:'agi_charm', name:'AGI Charm', type:'trinket', slot:'trinket', mods:{ AGI:2 } });
  equipItem(0,0);

  const secondMove = move(1,0);
  const boostedDelay = getMoveDelay();
  assert.ok(boostedDelay < baseDelay);
  const expected = calcMoveDelay(getTile(state.map, party.x, party.y), hero);
  assert.strictEqual(boostedDelay, expected);
  await secondMove;
});

test('queryTile reports entities and items', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.x=0; party.y=0;
  NPCS.length=0; itemDrops.length=0;
  NPCS.push({id:'n',map:'world',x:1,y:1,name:'N'});
  registerItem({id:'i',name:'Item',type:'quest'});
  itemDrops.push({id:'i',map:'world',x:2,y:0});
  let q=queryTile(0,0);
  assert.strictEqual(q.walkable,true);
  q=queryTile(1,1);
  assert.strictEqual(q.walkable,false);
  assert.strictEqual(q.entities.length,1);
  q=queryTile(2,0);
  assert.strictEqual(q.walkable,false);
  assert.strictEqual(q.items.length,1);
});

test('interactAt picks up adjacent item', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.x=0; party.y=0;
  itemDrops.length=0; player.inv.length=0;
  registerItem({id:'gem',name:'Gem',type:'quest'});
  const itm={id:'gem',map:'world',x:1,y:0};
  itemDrops.push(itm);
  interactAt(1,0);
  assert.ok(player.inv.some(it=>it.id==='gem'));
  assert.ok(!itemDrops.includes(itm));
});

test('useItem heals party member and consumes item', () => {
  party.length = 0; player.inv.length = 0;
  const m = new Character('h','Healer','Role');
  m.hp = 5; m.maxHp = 10;
  party.addMember(m);
  const tonic = registerItem({ id:'tonic', name:'Tonic', type:'consumable', use:{ type:'heal', amount:3 } });
  addToInv(tonic);
  useItem(0);
  assert.strictEqual(m.hp, 8);
  assert.strictEqual(player.inv.length, 0);
});

test('findFreeDropTile avoids water and party tiles', () => {
  const W=120, H=90;
  const world = Array.from({length:H},()=>Array.from({length:W},()=>7));
  world[10][10] = 2; // water
  applyModule({world});
  state.map='world';
  party.x=0; party.y=0;
  NPCS.length=0;
  NPCS.push({map:'world', x:0, y:0});
  let spot = findFreeDropTile('world',0,0);
  assert.ok(spot.x !== 0 || spot.y !== 0);
  spot = findFreeDropTile('world',10,10);
  assert.notStrictEqual(world[spot.y][spot.x],2);
});

test('selected party member receives XP on dialog success', () => {
  const W=120, H=90;
  const world = Array.from({length:H},()=>Array.from({length:W},()=>7));
  applyModule({world, npcs:[{id:'s', map:'world', x:1, y:0, name:'Sage', tree:{start:{text:'hi', choices:[{label:'learn', reward:'XP 5', to:'bye'}]}}}]});
  state.map='world';
  party.x=0; party.y=0;
  party.length=0;
  const a=new Character('a','A','Role');
  const b=new Character('b','B','Role');
  party.addMember(a);
  party.addMember(b);
  setLeader(1);
  a.xp=0; b.xp=0;
  openDialog(NPCS[0]);
  choicesEl.children[0].onclick();
  assert.strictEqual(a.xp,0);
  assert.strictEqual(b.xp,5);
});

test('level up grants +10 max HP and a skill point', () => {
  const c = new Character('c','C','Role');
  c.skillPoints = 0;
  const need = xpToNext(c.lvl);
  c.awardXP(need);
  assert.strictEqual(c.lvl, 2);
  assert.strictEqual(c.maxHp, 20);
  assert.strictEqual(c.hp, 20);
  assert.strictEqual(c.skillPoints, 1);
});

test('mentor bark plays sound and shows text', () => {
  party.flags.mentor = true;
  const msgs = [];
  const prevToast = global.toast;
  global.toast = (m) => msgs.push(m);
  const sounds = [];
  EventBus.on('sfx', (id) => sounds.push(id));
  const c = new Character('m','M','Role');
  const need = xpToNext(c.lvl);
  c.awardXP(need);
  assert.ok(msgs.includes('Another scar, another lesson learned.'));
  assert.ok(sounds.includes('mentor'));
  global.toast = prevToast;
});

test('respec consumes memory worm and restores skill points', () => {
  party.length = 0;
  player.inv.length = 0;
  const c = new Character('m','M','Role');
  c.lvl = 3;
  c.skillPoints = 0;
  c.stats.STR += 2;
  party.addMember(c);
  setLeader(0);
  registerItem({ id:'memory_worm', name:'Memory Worm', type:'token' });
  addToInv('memory_worm');
  const idx = findItemIndex('memory_worm');
  assert.ok(idx !== -1);
  const ok = respec();
  assert.ok(ok);
  assert.strictEqual(findItemIndex('memory_worm'), -1);
  assert.deepStrictEqual(c.stats, baseStats());
  assert.strictEqual(c.skillPoints, 2);
});

test('bosses can drop memory worms', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m = new Character('p','P','Role');
  party.addMember(m);
  setLeader(0);
  registerItem({ id:'memory_worm', name:'Memory Worm', type:'token' });
  const origRand = Math.random;
  Math.random = () => 0.05;
  const resultPromise = openCombat([{ name:'Boss', hp:1, boss:true }]);
  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  Math.random = origRand;
  assert.strictEqual(res.result, 'loot');
  assert.ok(player.inv.some(it=>it.id==='memory_worm'));
});

test('boss memory worm drop respects probability', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m = new Character('p','P','Role');
  party.addMember(m);
  setLeader(0);
  registerItem({ id:'memory_worm', name:'Memory Worm', type:'token' });
  const origRand = Math.random;
  Math.random = () => 0.5;
  const resultPromise = openCombat([{ name:'Boss', hp:1, boss:true }]);
  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  Math.random = origRand;
  assert.strictEqual(res.result, 'loot');
  assert.ok(!player.inv.some(it=>it.id==='memory_worm'));
});

test('advanceDialog moves to next node', () => {
  const tree = {
    start: { text: 'hi', next: [{ id: 'bye', label: 'Bye' }] },
    bye: { text: 'bye', next: [] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(dialog.node, 'bye');
});

test('advanceDialog handles cost and reward', () => {
  player.inv.length = 0;
  const key = registerItem({id:'key',name:'Key',type:'quest'});
  registerItem({id:'gem',name:'Gem',type:'quest'});
  addToInv(key);
  const tree = {
    start: { text: '', next: [{ label: 'Use Key', costItem: 'key', reward: 'gem' }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(player.inv.some(it => it.id === 'gem'));
  assert.ok(!player.inv.some(it => it.id === 'key'));
  assert.ok(res.close);
  assert.ok(res.success);
});

test('advanceDialog respects goto with costItem', () => {
  player.inv.length = 0;
  const key = registerItem({id:'key',name:'Key',type:'quest'});
  addToInv(key);
  state.map = 'world';
  party.x = 0; party.y = 0;
  const tree = {
    start: { text: '', next: [{ label: 'Go', costItem: 'key', goto: { map: 'room', x: 3, y: 4 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(party.x, 3);
  assert.strictEqual(party.y, 4);
  assert.ok(!player.inv.some(it => it.id === 'key'));
});

test('advanceDialog respects costSlot', () => {
  player.inv.length = 0;
  const trinket = registerItem({ id: 'river_trinket', name: 'Trinket', slot: 'trinket', type: 'trinket' });
  addToInv(trinket);
  const tree = {
    start: { text: '', next: [ { label: 'Pay', costSlot: 'trinket', to: 'end' } ] },
    end: { text: '' }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(res.success);
  assert.ok(!player.inv.some(it => it.slot === 'trinket'));
});

test('advanceDialog honours reqSlot', () => {
  player.inv.length = 0;
  const token = registerItem({ id: 'fae_token', name: 'Fae Token', slot: 'trinket', type: 'trinket' });
  const tree = {
    start: { text: '', next: [ { label: 'Enter', reqSlot: 'trinket', success: 'ok', to: 'end' }, { label: 'Leave', to: 'end' } ] },
    end: { text: '' }
  };
  let dialog = { tree, node: 'start' };
  // Without item should fail
  let res = advanceDialog(dialog, 0);
  assert.ok(!res.success);
  // With item should succeed
  addToInv(token);
  dialog = { tree, node: 'start' };
  res = advanceDialog(dialog, 0);
  assert.ok(res.success);
  assert.ok(player.inv.some(it => it.slot === 'trinket'));
});

test('advanceDialog uses reqItem without consuming and allows goto', () => {
  player.inv.length = 0;
  const pass = registerItem({id:'pass',name:'Pass',type:'quest'});
  addToInv(pass);
  state.map = 'world';
  party.x = 1; party.y = 1;
  const tree = {
    start: { text: '', next: [{ label: 'Enter', reqItem: 'pass', goto: { map: 'room', x: 5, y: 6 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(party.x, 5);
  assert.strictEqual(party.y, 6);
  assert.ok(player.inv.some(it => it.id === 'pass'));
});

test('advanceDialog matches reqItem case-insensitively', () => {
  player.inv.length = 0;
  const accessCard = registerItem({id:'access_card',name:'access card',type:'quest',tags:['pass']});
  addToInv(accessCard);
  state.map = 'world';
  party.x = 2; party.y = 2;
  const tree = {
    start: { text: '', next: [{ label: 'Up', reqItem: 'PASS', goto: { map: 'room', x: 7, y: 8 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(party.x, 7);
  assert.strictEqual(party.y, 8);
});

test('advanceDialog goto can target NPC', () => {
  NPCS.length = 0;
  const tree = { start: { text: '', choices: [ { label: 'Move', goto: { target: 'npc', x: 1, y: 2 } } ] } };
  const npc = makeNPC('m', 'world', 0, 0, '#fff', 'Mover', '', '', tree);
  NPCS.push(npc);
  openDialog(npc);
  choicesEl.children[0].onclick();
  assert.strictEqual(npc.x, 1);
  assert.strictEqual(npc.y, 2);
  closeDialog();
  NPCS.length = 0;
});

test('advanceDialog goto supports relative movement', () => {
  state.map = 'world';
  party.x = 4; party.y = 5;
  const tree = { start: { text: '', next: [ { label: 'Step', goto: { rel: true, x: 2, y: -1 } } ] } };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(party.x, 6);
  assert.strictEqual(party.y, 4);
});

test('advanceDialog returns success flag on failure', () => {
  const tree = {
    start: { text: '', next: [{ label: 'Fail', check: { stat: 'str', dc: 999 } }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.strictEqual(res.success, false);
});

test('once choice consumed on failed check', () => {
  globalThis.usedOnceChoices.clear();
  const npc = { id: 'tester', name: 'Tester', tree: { start: { text: '', next: [{ label: 'Try', once: true, check: { stat: 'str', dc: 999 }, failure: 'nope' }] } } };
  openDialog(npc);
  const key = 'tester::start::Try';
  choicesEl.children[0].onclick();
  assert.ok(globalThis.usedOnceChoices.has(key));
  closeDialog();
});

test('once choice persists when lacking item', () => {
  globalThis.usedOnceChoices.clear();
  player.inv.length = 0;
  const npc = { id: 'tester', name: 'Tester', tree: { start: { text: '', next: [
    { label: 'Pay', once: true, costSlot: 'trinket', failure: 'nope' }
  ] } } };
  openDialog(npc);
  const key = 'tester::start::Pay';
  choicesEl.children[0].onclick();
  assert.ok(!globalThis.usedOnceChoices.has(key));
  closeDialog();
});

test('door portals link interiors', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  const forest = { id:'forest', w:3, h:3, grid:[[6,6,6],[6,8,6],[6,6,6]], entryX:1, entryY:1 };
  const castle = { id:'castle', w:3, h:3, grid:[[6,6,6],[6,8,6],[6,6,6]], entryX:1, entryY:1 };
  applyModule({world, interiors:[forest, castle], portals:[{ map:'forest', x:1, y:1, toMap:'castle', toX:1, toY:1 },{ map:'castle', x:1, y:1, toMap:'forest', toX:1, toY:1 }]});
  state.map='forest'; party.x=1; party.y=1;
  interactAt(1,1);
  assert.strictEqual(state.map, 'castle');
  interactAt(1,1);
  assert.strictEqual(state.map, 'forest');
});

test('applyModule overwrites existing interiors', () => {
  applyModule({ interiors: [{ id: 'dup', w: 1, h: 1, grid: [[7]], entryX: 0, entryY: 0 }] });
  applyModule({ interiors: [{ id: 'dup', w: 2, h: 2, grid: [[7,7],[7,7]], entryX: 1, entryY: 1 }] });
  assert.strictEqual(interiors.dup.w, 2);
  assert.strictEqual(interiors.dup.h, 2);
});

test('makeInteriorRoom supports custom size', () => {
  const id = makeInteriorRoom('big', 20, 15);
  const I = interiors[id];
  assert.strictEqual(I.w, 20);
  assert.strictEqual(I.h, 15);
  assert.strictEqual(I.grid.length, 15);
  assert.strictEqual(I.grid[0].length, 20);
});

test('placeHut uses custom grid and door', () => {
  const grid = [
    [TILE.BUILDING, TILE.DOOR],
    [null, TILE.BUILDING]
  ];
  const before = getTile('world', 0, 1);
  const b = placeHut(0, 0, { interiorId: makeInteriorRoom(), grid });
  assert.strictEqual(b.w, 2);
  assert.strictEqual(b.h, 2);
  assert.strictEqual(getTile('world', 1, 0), TILE.DOOR);
  assert.strictEqual(getTile('world', 0, 1), before);
});

test('quest turn-in grants reward item', () => {
  player.inv.length = 0;
  NPCS.length = 0;
  registerItem({ id: 'cursed_vr_helmet', name: 'Cursed VR Helmet', type: 'armor', slot: 'armor' });
  const quest = new Quest('q_reward', 'Quest', '', { reward: 'cursed_vr_helmet' });
  quest.status = 'active';
  const tree = {
    start: { text: '', choices: [ { label: 'turn in', to: 'do_turnin', q: 'turnin' } ] },
    do_turnin: { text: '', choices: [ { label: 'bye', to: 'bye' } ] }
  };
  const npc = makeNPC('jen', 'world', 0, 0, '#fff', 'Jen', '', '', tree, quest);
  NPCS.push(npc);
  openDialog(npc);
  choicesEl.children[0].onclick();
  assert.ok(player.inv.some(it => it.id === 'cursed_vr_helmet'));
});

test('quest turn-in awards XP once', () => {
  for (const k in quests) delete quests[k];
  NPCS.length = 0;
  party.length = 0;
  const char = new Character('g', 'Gil', 'Role');
  party.addMember(char);
  const quest = new Quest('q_xp', 'Quest', '', { xp: 4 });
  const npc = { quest };
  defaultQuestProcessor(npc, 'do_turnin');
  assert.strictEqual(char.xp, 4);
});

test('turn-in choice appears immediately after accepting', () => {
  player.inv.length = 0;
  NPCS.length = 0;
  const quest = new Quest('q_hidden', 'Quest', '');
  const tree = {
    start: { text: '', choices: [
      { label: 'accept', to: 'accept', q: 'accept' },
      { label: 'turn in', to: 'do_turnin', q: 'turnin' }
    ] },
    accept: { text: '', choices: [ { label: 'bye', to: 'bye' } ] },
    do_turnin: { text: '', choices: [ { label: 'bye', to: 'bye' } ] }
  };
  const npc = makeNPC('jen', 'world', 0, 0, '#fff', 'Jen', '', '', tree, quest);
  NPCS.push(npc);

  openDialog(npc);
  let labels = choicesEl.children.map(c => c.textContent);
  assert.ok(!labels.includes('turn in'));

  // accept quest
  choicesEl.children[0].onclick();

  labels = choicesEl.children.map(c => c.textContent);
  assert.ok(labels.includes('turn in'));
  closeDialog();
});

test('createNpcFactory builds NPCs from definitions', () => {
  const defs = [{
    id: 't',
    map: 'world',
    name: 'Tester',
    tree: '{"start":{"text":"hi","choices":[{"label":"bye","to":"bye"}]}}',
    portraitSheet: 'assets/portraits/portrait_1000.png'
  }];
  const factory = createNpcFactory(defs);
  const npc = factory.t(2, 3);
  assert.strictEqual(npc.id, 't');
  assert.strictEqual(npc.x, 2);
  assert.strictEqual(npc.y, 3);
  assert.strictEqual(npc.map, 'world');
  assert.strictEqual(npc.tree.start.text, 'hi');
  assert.strictEqual(npc.portraitSheet, 'assets/portraits/portrait_1000.png');
});

test('createNpcFactory defaults empty tree to dialog', () => {
  const defs = [{ id: 'n', map: 'world', dialog: 'Hi', tree: {} }];
  const factory = createNpcFactory(defs);
  const npc = factory.n();
  assert.strictEqual(npc.tree.start.text, 'Hi');
  assert.ok(npc.tree.start.choices.some(c => c.label === '(Leave)'));
});

test('createNpcFactory applies loop points', () => {
  const defs = [{ id: 'm', map: 'world', loop: [{x:0,y:0},{x:1,y:0}] }];
  const factory = createNpcFactory(defs);
  const npc = factory.m();
  assert.deepStrictEqual(npc.loop, [{x:0,y:0},{x:1,y:0}]);
});

test('openDialog displays portrait when sheet provided', () => {
  NPCS.length = 0;
  const tree = { start: { text: '', choices: [] } };
  const npc = makeNPC('p', 'world', 0, 0, '#fff', 'Port', '', '', tree, null, null, null, { portraitSheet: 'assets/portraits/kesh_4.png' });
  NPCS.push(npc);
  openDialog(npc);
  assert.ok(portEl.style.backgroundImage.includes('kesh_4.png'));
});

test('openDialog uses full image when not sprite sheet', () => {
  NPCS.length = 0;
  const tree = { start: { text: '', choices: [] } };
  const img = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>').toString('base64');
  const npc = makeNPC('p2', 'world', 0, 0, '#fff', 'Port2', '', '', tree, null, null, null, { portraitSheet: img });
  NPCS.push(npc);
  openDialog(npc);
  assert.strictEqual(portEl.style.backgroundSize, '100% 100%');
});

test('setPortraitDiv uses full image when not sprite sheet', () => {
  const el = stubEl();
  const img = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>').toString('base64');
  setPortraitDiv(el, { portraitSheet: img });
  assert.strictEqual(el.style.backgroundSize, '100% 100%');
});

test('joinParty copies current NPC portraitSheet', () => {
  party.length = 0;
  NPCS.length = 0;
  currentNPC = { id: 'j', name: 'Joker', portraitSheet: 'assets/portraits/portrait_1000.png' };
  joinParty({ id: 'j', name: 'Joker', role: 'Trickster' });
  assert.strictEqual(party[0].portraitSheet, 'assets/portraits/portrait_1000.png');
  currentNPC = null;
});

test('clamp swaps reversed bounds', () => {
  assert.strictEqual(clamp(5, 10, 0), 5);
});

test('makeNPC tolerates start nodes without choices', () => {
  const tree = { start: { text: 'growl' } };
  const npc = makeNPC('beast', 'world', 0, 0, '#fff', 'Beast', '', '', tree, null, null, null, { combat: { DEF: 1 } });
  assert.ok(Array.isArray(npc.tree.start.choices));
  const fights = npc.tree.start.choices.filter(c => c.label === '(Fight)');
  assert.strictEqual(fights.length, 1);
});

test('makeNPC normalizes existing fight choices', () => {
  const quest = new Quest('q_boss', 'Boss', '');
  quest.status = 'active';
  const tree = { start: { text: 'growl', choices: [ { label: '(Fight)', to: 'bye', q: 'turnin' }, { label: '(Leave)', to: 'bye' } ] } };
  const npc = makeNPC('beast', 'world', 0, 0, '#fff', 'Beast', '', '', tree, quest, null, null, { combat: { DEF: 1 } });
  const fights = npc.tree.start.choices.filter(c => c.label === '(Fight)');
  assert.strictEqual(fights.length, 1);
  assert.strictEqual(fights[0].to, 'do_fight');
  assert.strictEqual(fights[0].q, 'turnin');
});

test('fight choice triggers combat', () => {
  NPCS.length = 0;
  const orig = globalThis.Dustland.actions.startCombat;
  let triggered = false;
  globalThis.Dustland.actions.startCombat = () => { triggered = true; };
  const npc = makeNPC('rival', 'world', 0, 0, '#fff', 'Rival', '', '', null, null, null, null, { combat: { DEF: 1 } });
  NPCS.push(npc);
  openDialog(npc);
  const fightBtn = choicesEl.children.find(c => c.textContent === '(Fight)');
  fightBtn.onclick();
  assert.ok(triggered);
  globalThis.Dustland.actions.startCombat = orig;
});

test('boss special telegraphs before striking', async () => {
  party.length = 0;
  party.push({ name: 'Hero', hp: 10 });
  openCombat([{ name: 'Boss', special: { cue: 'gathers power', dmg: 5, delay: 0 } }]);
  enemyPhase();
  assert.ok(combatOverlay.classList.contains('warning'));
  await new Promise(r => setTimeout(r, 10));
  assert.strictEqual(party[0].hp, 5);
  assert.ok(!combatOverlay.classList.contains('warning'));
  closeCombat('flee');
});

test('choices pointing to bye are rendered last', () => {
  NPCS.length = 0;
  const tree = {
    start: {
      text: '',
      choices: [
        { label: '(Leave)', to: 'bye' },
        { label: 'Later', to: 'bye' },
        { label: 'Talk', to: 'talk' }
      ]
    },
    talk: { text: '', choices: [] },
    bye: { text: '', choices: [] }
  };
  const npc = makeNPC('b', 'world', 0, 0, '#fff', 'B', '', '', tree);
  NPCS.push(npc);
  openDialog(npc);
  const labels = choicesEl.children.map(c => c.textContent);
  assert.strictEqual(labels[0], 'Talk');
  const tail = labels.slice(1).sort();
  assert.deepStrictEqual(tail, ['(Leave)', 'Later'].sort());
});

test('hidden NPC reveals after visit condition met', () => {
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  state.map = 'world';
  NPCS.length = 0;
  applyModule({ npcs: [ { id: 'herm', map: 'world', x: 1, y: 1, name: 'Herm', hidden: true, reveal: { flag: 'visits@world@1,1', op: '>=', value: 2 } } ] });
  assert.strictEqual(NPCS.length, 0);
  setPartyPos(1,1);
  assert.strictEqual(NPCS.length, 0);
  setPartyPos(0,0);
  setPartyPos(1,1);
  assert.strictEqual(NPCS.length, 1);
  assert.strictEqual(NPCS[0].id, 'herm');
});

test('dialog choices can be gated by world flags', () => {
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  state.map = 'world';
  NPCS.length = 0;
  const tree = { start:{ text:'hi', choices:[ { label:'always', to:'bye' }, { label:'secret', to:'bye', if:{ flag:'visits@world@5,5', op:">=", value:1 } } ] }, bye:{ text:'', choices:[] } };
  const npc = makeNPC('t', 'world', 0, 0, '#fff', 'T', '', '', tree);
  NPCS.push(npc);
  openDialog(npc);
  assert.strictEqual(choicesEl.children.length, 1);
  closeDialog();
  setPartyPos(5,5);
  openDialog(npc);
  assert.strictEqual(choicesEl.children.length, 2);
  closeDialog();
});
test('dialog choices can be gated by party flags', () => {
  party.flags = {};
  state.map = 'world';
  NPCS.length = 0;
  const tree = { start:{ text:'hi', choices:[ { label:'secret', to:'bye', if:{ flag:'demo', op:">=", value:1 } } ] }, bye:{ text:'', choices:[] } };
  const npc = makeNPC('p', 'world', 0, 0, '#fff', 'P', '', '', tree);
  NPCS.push(npc);
  openDialog(npc);
  assert.strictEqual(choicesEl.children.length, 0);
  closeDialog();
  Effects.apply([{ effect:'addFlag', flag:'demo' }], { party });
  openDialog(npc);
  assert.strictEqual(choicesEl.children.length, 1);
  closeDialog();
});
test('board/unboard effects toggle building access', () => {
  globalThis.buildings = [ { interiorId: 'castle', boarded: true } ];
  Effects.apply([{ effect: 'unboardDoor', interiorId: 'castle' }]);
  assert.strictEqual(globalThis.buildings[0].boarded, false);
  Effects.apply([{ effect: 'boardDoor', interiorId: 'castle' }]);
  assert.strictEqual(globalThis.buildings[0].boarded, true);
  globalThis.buildings.length = 0;
});
test('onEnter triggers effects and temporary stat mod', async () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.x=0; party.y=0;
  party.length=0;
  const hero = new Character('h','Hero','Role');
  party.addMember(hero);
  registerTileEvents([{map:'world', x:1, y:0, events:[{when:'enter', effect:'toast', msg:'You smell rot.'},{when:'enter', effect:'modStat', stat:'CHA', delta:-1, duration:2}]}]);
  const msgs=[];
  global.toast = (m)=>msgs.push(m);
  await move(1,0);
  assert.strictEqual(party.x,1);
  assert.ok(msgs.includes('You smell rot.'));
  assert.strictEqual(party[0].stats.CHA,3);
  await move(1,0);
  assert.strictEqual(party[0].stats.CHA,3);
  await move(1,0);
  assert.strictEqual(party[0].stats.CHA,4);
  assert.strictEqual(buffs.length,0);
});
test('handleDialogKey navigates dialog choices with WASD', () => {
  NPCS.length = 0;
  const npc = { id: 'nav', name: 'Nav', tree: { start: { text: '', choices: [ { label: 'One' }, { label: 'Two' } ] } } };
  NPCS.push(npc);
  openDialog(npc);
  const picked = [];
  choicesEl.children[0].click = () => picked.push('One');
  choicesEl.children[1].click = () => picked.push('Two');

  handleDialogKey({ key: 's' });
  handleDialogKey({ key: 'Enter' });
  handleDialogKey({ key: 'w' });
  handleDialogKey({ key: 'Enter' });

  assert.deepStrictEqual(picked, ['Two', 'One']);
});

test('party enforces maximum size of six', () => {
  party.length = 0;
  const members = [
    new Character('a','A','Role'),
    new Character('b','B','Role'),
    new Character('c','C','Role'),
    new Character('d','D','Role'),
    new Character('e','E','Role'),
    new Character('f','F','Role'),
    new Character('g','G','Role')
  ];
  members.slice(0,6).forEach(m=>assert.strictEqual(party.addMember(m), true));
  assert.strictEqual(party.addMember(members[6]), false);
  assert.strictEqual(party.length, 6);
});

test('NPC is not removed when party is full', () => {
  party.length = 0;
  const members = [
    new Character('a','A','Role'),
    new Character('b','B','Role'),
    new Character('c','C','Role'),
    new Character('d','D','Role'),
    new Character('e','E','Role'),
    new Character('f','F','Role')
  ];
  members.forEach(m=>party.addMember(m));

  const npc = { id: 'r', name: 'Recruit', map:'world', x:1, y:0,
    tree: { start: { text: '', choices: [ { label: 'Join', join: { id:'r', name:'Recruit', role:'Role' } } ] } } };
  NPCS.length = 0; NPCS.push(npc);
  openDialog(npc);
  choicesEl.children[0].onclick();
  assert.strictEqual(party.length, 6);
  assert.ok(NPCS.includes(npc));
});

test('cannot remove created party members', () => {
  party.length = 0; NPCS.length = 0;
  const base = new Character('a','A','Role', {permanent:true});
  const recruit = new Character('b','B','Role');
  party.addMember(base); party.addMember(recruit);
  assert.strictEqual(party.removeMember(base), false);
  assert.strictEqual(party.length, 2);
  assert.strictEqual(NPCS.length, 0);
});

test('removed member becomes NPC at current location', () => {
  party.length = 0; NPCS.length = 0;
  state.map = 'world'; party.map = 'world'; party.x = 0; party.y = 0;
  const base = new Character('a','A','Role', {permanent:true});
  const recruit = new Character('b','B','Role');
  party.addMember(base); party.addMember(recruit);
  assert.strictEqual(party.removeMember(recruit), true);
  assert.strictEqual(party.length, 1);
  const npc = NPCS.find(n=>n.id==='b');
  assert.ok(npc);
  assert.strictEqual(npc.map, 'world');
  assert.strictEqual(npc.x, 0);
  assert.strictEqual(npc.y, 0);
});

test('NPCs are removed individually during combat', async () => {
  NPCS.length = 0;
  const npc1 = { id:'n1', map:'world', x:0, y:0, name:'N1' };
  const npc2 = { id:'n2', map:'world', x:1, y:0, name:'N2' };
  NPCS.push(npc1, npc2);
  party.length = 0;
  const m1 = new Character('p1','P1','Role');
  const m2 = new Character('p2','P2','Role');
  party.addMember(m1);
  party.addMember(m2);
  player.inv.length = 0;

  const resultPromise = openCombat([
    { name:'E1', hp:1, npc:npc1, loot:{ id:'l1', name:'L1' } },
    { name:'E2', hp:1, npc:npc2, loot:{ id:'l2', name:'L2' } }
  ]);

  handleCombatKey({ key:'Enter' });
  assert.ok(!NPCS.includes(npc1));
  assert.ok(NPCS.includes(npc2));
  assert.ok(player.inv.some(it=>it.id==='l1'));
  assert.ok(!player.inv.some(it=>it.id==='l2'));

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
  assert.strictEqual(NPCS.length, 0);
  assert.ok(player.inv.some(it=>it.id==='l1'));
  assert.ok(player.inv.some(it=>it.id==='l2'));
});

test('defeated enemies can drop spoils cache', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  itemDrops.length = 0;
  const logs = [];
  const origLog = global.log;
  global.log = (msg) => logs.push(msg);
  const m1 = new Character('p1','P1','Role');
  party.addMember(m1);
  const origRoll = SpoilsCache.rollDrop;
  SpoilsCache.rollDrop = () => SpoilsCache.create('sealed');
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  SpoilsCache.rollDrop = origRoll;
  global.log = origLog;
  assert.strictEqual(res.result, 'loot');
  assert.strictEqual(itemDrops.length, 1);
  assert.ok(logs.some(l => l.includes('Sealed Cache')));
});

test('fallen party members are revived after combat', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 1;
  party.addMember(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:3 }
  ]);

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'bruise');
  assert.strictEqual(party.length, 1);
  assert.ok(party[0].hp >= 1);
});

test('combat hp bars update after damage', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 2;
  m1.maxHp = 2;
  party.addMember(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:2, maxHp:2 }
  ]);

  handleCombatKey({ key:'Enter' });
  const enemyHp = combatEnemies.children[0].children[1].children[0].style.width;
  const memberHp = combatParty.children[0].children[1].children[0].style.width;
  assert.strictEqual(enemyHp, '50%');
  assert.strictEqual(memberHp, '50%');

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('enemy hp bar defaults maxHp to hp', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 2;
  m1.maxHp = 2;
  party.addMember(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:2 }
  ]);

  handleCombatKey({ key:'Enter' });
  const enemyHp = combatEnemies.children[0].children[1].children[0].style.width;
  assert.strictEqual(enemyHp, '50%');

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('combat menu can be clicked', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.addMember(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:1 }
  ]);

  combatClickHandler({ target: combatCmd.children[0] });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('turn indicator updates with active member', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ label:'Power Hit', dmg:2 }] });
  party.addMember(m1);
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  assert.strictEqual(turnIndicator.textContent, "P1's turn");
  closeCombat('flee');
  await resultPromise;
});

test('special menu lists class ability', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ label:'Power Hit', dmg:2 }] });
  party.addMember(m1);
  const resultPromise = openCombat([{ name:'E1', hp:3 }]);
  combatClickHandler({ target: combatCmd.children[1] });
  assert.strictEqual(combatCmd.children[0].textContent, 'Power Hit');
  closeCombat('flee');
  await resultPromise;
});

test('openCombat preserves adrenaline for party members', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.adr = 50;
  m1.maxAdr = 150;
  party.addMember(m1);
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  assert.strictEqual(party[0].adr, 50);
  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('basic attack plays adrenaline fx', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.addMember(m1);
  const calls = [];
  global.playFX = (t) => calls.push(t);
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  handleCombatKey({ key:'Enter' });
  assert.deepStrictEqual(calls, ['adrenaline']);
  closeCombat('flee');
  await resultPromise;
});

test('special move triggers fx', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ label:'Power Hit', dmg:2 }] });
  party.addMember(m1);
  const calls = [];
  global.playFX = (t) => calls.push(t);
  const resultPromise = openCombat([{ name:'E1', hp:3 }]);
  handleCombatKey({ key:'ArrowDown' });
  handleCombatKey({ key:'Enter' });
  handleCombatKey({ key:'Enter' });
  assert.ok(calls.includes('special'));
  closeCombat('flee');
  await resultPromise;
});

test('status effects play fx', () => {
  const calls = [];
  global.playFX = (t) => calls.push(t);
  Effects.apply([{ effect:'modStat', stat:'ATK', delta:1 }], { actor:{ stats:{ ATK:0 } } });
  assert.deepStrictEqual(calls, ['status']);
});

test('adrenaline cools when walking at full health', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.adr = 20;
  party.addMember(m1);
  await move(1,0);
  assert.strictEqual(m1.adr, 18);
});

test('healParty restores HP and clears adrenaline', () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 5;
  m1.adr = 30;
  party.addMember(m1);
  healParty();
  assert.strictEqual(m1.hp, m1.maxHp);
  assert.strictEqual(m1.adr, 0);
});

test('startCombat forwards portraitSheet', async () => {
  let captured;
  const orig = global.openCombat;
  global.openCombat = async (enemies) => { captured = enemies; return { result:'flee' }; };
  const defender = { name:'R', HP:5, portraitSheet:'img.png' };
  const res = await global.startCombat(defender);
  global.openCombat = orig;
  assert.strictEqual(captured[0].portraitSheet, 'img.png');
  assert.strictEqual(res.result, 'flee');
});

test('save serializes party when map method is shadowed', () => {
  party.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.addMember(m1);
  party.map = 'world';
  const store = {};
  const orig = global.localStorage;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k]; },
    removeItem(k){ delete store[k]; }
  };
  assert.doesNotThrow(() => save());
  global.localStorage = orig;
  const saved = JSON.parse(store['dustland_crt']);
  assert.strictEqual(saved.party[0].id, 'p1');
  assert.strictEqual(saved.party.length, 1);
});

test('save/load preserves NPC loops', () => {
  const world = Array.from({length:3},()=>Array.from({length:3},()=>7));
  applyModule({world, npcs:[{id:'p', map:'world', x:0, y:0, loop:[{x:0,y:0},{x:2,y:0}]}]});
  const store = {};
  const orig = global.localStorage;
  global.localStorage = {
    setItem(k,v){ store[k]=v; },
    getItem(k){ return store[k]; },
    removeItem(k){ delete store[k]; }
  };
  save();
  NPCS.length = 0;
  load();
  global.localStorage = orig;
  assert.deepStrictEqual(NPCS[0].loop, [{x:0,y:0},{x:2,y:0}]);
});

test('combat overlay sits behind the log panel', async () => {
  const css = await fs.readFile(new URL('../dustland.css', import.meta.url), 'utf8');
  assert.match(css, /\.panel\s*{[\s\S]*z-index:\s*15/);
  assert.match(css, /#combatOverlay\s*{[\s\S]*z-index:\s*10/);
});

test('combat overlay leaves room for panel', async () => {
  const css = await fs.readFile(new URL('../dustland.css', import.meta.url), 'utf8');
  assert.match(css, /#combatOverlay\s*{[\s\S]*right:\s*var\(--panelW\)/);
  assert.match(css, /:root\s*{[\s\S]*--panelW:\s*440px/);
});

test('distance to road increases encounter chance', () => {
  const row = Array(6).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  applyModule({ world: [row], encounters: { world: [ { name: 'Test', HP: 1, DEF: 0 } ] } });
  state.map = 'world';
  setPartyPos(5, 0);
  let started = false;
  const origRand = Math.random;
  Math.random = () => 0;
  globalThis.Dustland.actions.startCombat = () => { started = true; };
  checkRandomEncounter();
  Math.random = origRand;
  assert.ok(started);
});

test('no encounters occur on roads', () => {
  const row = Array(2).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  applyModule({ world: [row], encounters: { world: [ { name: 'Test', HP: 1, DEF: 0 } ] } });
  state.map = 'world';
  setPartyPos(0, 0);
  let started = false;
  const origRand = Math.random;
  Math.random = () => 0;
  globalThis.Dustland.actions.startCombat = () => { started = true; };
  checkRandomEncounter();
  Math.random = origRand;
  assert.ok(!started);
});

test('applyModule from dialog adds next fragment', async () => {
  await import('../modules/broadcast-fragment-1.module.js');
  await import('../modules/broadcast-fragment-2.module.js');
  applyModule(BROADCAST_FRAGMENT_1);
  assert.ok(!buildings.some(b => b.interiorId === 'comms_tower_base'));
  const state = {
    tree: {
      post_quest: {
        next: [
          { label: 'Head toward the tower.', applyModule: 'BROADCAST_FRAGMENT_2', to: 'bye' },
          { label: 'Not yet.', to: 'bye' }
        ]
      }
    },
    node: 'post_quest'
  };
  currentNPC = {};
  advanceDialog(state, 0);
  const tower = buildings.find(b => b.interiorId === 'comms_tower_base');
  assert.ok(tower);
  assert.ok(tower.x < WORLD_W && tower.y < WORLD_H);

});

test('grin offers trinket option after charm fails', () => {
  NPCS.length = 0;
  party.length = 0;
  const hero = new Character('h', 'Hero', 'Leader');
  party.push(hero);
  const tree = {
    start: {
      text: '',
      choices: [
        { label: '(Recruit) Join me.', to: 'rec', ifOnce: { node: 'rec', label: '(CHA) Talk up the score' } },
        { label: '(Recruit) Got a trinket?', to: 'rec_fail', ifOnce: { node: 'rec', label: '(CHA) Talk up the score', used: true } },
        { label: '(Leave)', to: 'bye' }
      ]
    },
    rec: {
      text: 'Convince me. Or pay me.',
      choices: [
        { label: '(CHA) Talk up the score', check: { stat: 'CHA', dc: DC.TALK }, failure: 'No deal.', once: true },
        { label: '(Pay) Give 1 trinket as hire bonus', costSlot: 'trinket', join: { id: 'grin', name: 'Grin', role: 'Scavenger' } },
        { label: '(Back)', to: 'start' }
      ]
    },
    rec_fail: {
      text: 'Charm didn\'t work. Got a trinket?',
      choices: [
        { label: '(Pay) Give 1 trinket as hire bonus', costSlot: 'trinket', join: { id: 'grin', name: 'Grin', role: 'Scavenger' } },
        { label: '(Back)', to: 'start' }
      ]
    },
    bye: { text: '' }
  };
  const grin = makeNPC('grin', 'world', 0, 0, '#fff', 'Grin', '', '', tree);
  const origRand = Math.random;
  Math.random = () => 0;
  openDialog(grin);
  // start -> rec
  choicesEl.children[0].onclick();
  // rec -> fail CHA
  choicesEl.children[0].onclick();
  // close
  choicesEl.children[0].onclick();
  Math.random = origRand;
  openDialog(grin);
  assert.strictEqual(choicesEl.children[0].textContent, '(Recruit) Got a trinket?');
  // start -> rec_fail
  choicesEl.children[0].onclick();
  const labels = choicesEl.children.map(c => c.textContent);
  assert.ok(!labels.includes('(CHA) Talk up the score'));
});

test('grin recruitment offers persuade or pay options after recruiting', () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Leader');
  party.push(hero);
  const tree = {
    start: { text: '', choices: [ { label: '(Recruit) Join me.', to: 'rec' }, { label: '(Leave)', to: 'bye' } ] },
    rec: {
      text: 'Convince me. Or pay me.',
      choices: [
        { label: '(CHA) Talk up the score', check: { stat: 'CHA', dc: DC.TALK }, join: { id: 'grin', name: 'Grin', role: 'Scavenger' } },
        { label: '(Pay) Give 1 trinket as hire bonus', costSlot: 'trinket', join: { id: 'grin', name: 'Grin', role: 'Scavenger' } },
        { label: '(Back)', to: 'start' }
      ]
    },
    bye: { text: '' }
  };
  const grin = makeNPC('grin', 'world', 0, 0, '#fff', 'Grin', '', '', tree);
  NPCS.push(grin);
  openDialog(grin);
  // start -> rec
  choicesEl.children[0].onclick();
  const labels = choicesEl.children.map(c => c.textContent);
  assert.ok(labels.includes('(CHA) Talk up the score'));
  assert.ok(labels.includes('(Pay) Give 1 trinket as hire bonus'));
  closeDialog();
});
test('basic attacks generate adrenaline from weapon stats', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.equip.weapon = { mods: { ADR: 20 } };
  party.addMember(m1);
  const resultPromise = openCombat([{ name:'E1', hp:2 }]);
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(party[0].adr, 5);
  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('equipment modifiers apply at battle start', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.equip.weapon = { mods: { ADR: 10 } };
  m1.equip.trinket = { mods: { adrenaline_gen_mod: 2, granted_special: { label: 'Power Hit', dmg: 2 } } };
  party.addMember(m1);
  const resultPromise = openCombat([{ name: 'E1', hp: 2 }]);
  assert.strictEqual(m1.special.length, 1);
  handleCombatKey({ key: 'Enter' });
  assert.strictEqual(m1.adr, 5);
  handleCombatKey({ key: 'Enter' });
  await resultPromise;
});

test('enemy immune to basic attacks requires specials', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ label:'Power Hit', dmg:2 }] });
  party.addMember(m1);
  const resultPromise = openCombat([{ name:'Shield', hp:5, immune:['basic'] }]);
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(combatState.enemies[0].hp, 5);
  handleCombatKey({ key:'ArrowDown' });
  handleCombatKey({ key:'Enter' });
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(combatState.enemies[0].hp, 3);
  closeCombat('flee');
  await resultPromise;
});

// --- Test: enemy counters basic attacks ---
test('enemy counters basic attacks', async () => {
  party.length = 0;
  player.inv.length = 0;

  const m1 = new Character('p1', 'P1', 'Role');
  party.addMember(m1);

  const resultPromise = openCombat([{ name: 'Mirror', hp: 3, counterBasic: { dmg: 1 } }]);

  // Player basic attack
  handleCombatKey({ key: 'Enter' });

  // Enemy should lose 1 HP; player should take counter damage
  assert.strictEqual(combatState.enemies[0].hp, 2);
  assert.strictEqual(party[0].hp, 8);

  // Exit combat to resolve any pending state
  closeCombat('flee');
  await resultPromise;
});

// --- Test: combat log records player and enemy actions ---
test('combat log records player and enemy actions', async () => {
  party.length = 0;
  player.inv.length = 0;

  const m1 = new Character('p1', 'P1', 'Role');
  party.addMember(m1);

  const resultPromise = openCombat([{ name: 'E1', hp: 2 }]);

  // Player attacks twice; enemy should act in between/after depending on your loop
  handleCombatKey({ key: 'Enter' });
  handleCombatKey({ key: 'Enter' });

  await resultPromise;

  const logEntries = getCombatLog();
  assert.ok(logEntries.some(e => e.type === 'player' && e.action === 'attack'));
  assert.ok(logEntries.some(e => e.type === 'enemy' && e.action === 'attack'));
});

test('shop npc opens dialog before trading', () => {
  NPCS.length = 0;
  party.x = 0; party.y = 0;
  const shopNpc = makeNPC('shop', 'world', 1, 0, '#fff', 'Shopkeep', '', '', {
    start: { text: 'Trade?', choices: [ { label: '(Leave)', to: 'bye' } ] }
  }, null, null, null, { shop: { inv: [] } });
  NPCS.push(shopNpc);
  let openedShop = 0;
  const origOpenShop = global.openShop;
  global.openShop = () => { openedShop++; };
  interactAt(1, 0);
  assert.strictEqual(openedShop, 0);
  global.openShop = origOpenShop;
  closeDialog();
});
