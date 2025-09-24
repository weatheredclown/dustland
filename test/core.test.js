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
  '../scripts/core/profiles.js',
  '../scripts/game-state.js',
  '../scripts/dustland-core.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { clamp, createRNG, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog, applyModule, createNpcFactory, openDialog, closeDialog, NPCS, itemDrops, setLeader, resolveCheck, queryTile, interactAt, registerItem, getItem, setRNGSeed, useItem, registerTileEvents, buffs, handleDialogKey, worldFlags, makeNPC, Effects, openCombat, handleCombatKey, uncurseItem, save, loadModernSave, makeInteriorRoom, placeHut, TILE, getTile, healAll, buildings, world } = globalThis;
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
    party.join(new Character('t', 'T', 't'));
    registerItem({ id:'apple', name:'Apple' });
    addToInv('apple');
    assert.ok(player.inv.some(it=>it.id==='apple'));
  });

  test('registerItem requires an id', () => {
    assert.throws(() => registerItem({ name:'Nameless', type:'weapon' }), /id/);
  });

  test('picking up an item logs once', () => {
    player.inv.length = 0;
    party.length = 0;
    party.join(new Character('t', 'T', 't'));
    const oldLog = global.log;
    const oldToast = global.toast;
    const logs = [];
    const toasts = [];
    global.log = (msg) => logs.push(msg);
    global.toast = (msg) => toasts.push(msg);
    registerItem({ id: 'stone', name: 'Stone' });
    addToInv('stone');
    assert.deepStrictEqual(logs, ['Picked up Stone']);
    assert.deepStrictEqual(toasts, ['Picked up Stone']);
    global.log = oldLog;
    global.toast = oldToast;
  });

test('cursed items reveal on unequip attempt and stay equipped', () => {
  party.length = 0;
  player.inv.length = 0;
  const mem = new Character('t1','Tester','Role');
  party.join(mem);
  const cursed = normalizeItem({ id:'mask', name:'Mask', type:'armor', cursed:true });
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
  party.join(mem);
  interiors.office = { grid: [[0]], w:1, h:1 };
  const helm = normalizeItem({
    id: 'helm',
    name: 'Helm',
    type: 'armor',
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
  party.join(mem);
  const tp = normalizeItem({ id:'warp_ring', name:'Warp Ring', type:'trinket', equip:{ teleport:{ map:'world', x:5, y:6 }, msg:'whoosh' } });
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

test('applyModule preserves locked npc state', () => {
  NPCS.length = 0;
  const world = [[7]];
  const tree = {
    locked: { text: 'locked', choices: [{ label: '(Leave)', to: 'bye' }] },
    start: { text: 'open', choices: [{ label: '(Leave)', to: 'bye' }] },
    bye: { text: '', choices: [] }
  };
  applyModule({ world, npcs: [{ id: 'ch', map: 'world', x: 0, y: 0, name: 'Chest', locked: true, tree }] });
  const npc = NPCS[0];
  assert.strictEqual(npc.locked, true);
  openDialog(npc);
  assert.strictEqual(textEl.textContent, 'locked');
  closeDialog();
  NPCS.length = 0;
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

test('applyModule merges module personas into templates and state', async () => {
  const personaSrc = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');
  vm.runInThisContext(personaSrc, { filename: '../scripts/core/personas.js' });
  const dl = globalThis.Dustland;
  const baseLabel = dl.personaTemplates['mara.masked'].label;
  const basePortrait = dl.personaTemplates['mara.masked'].portrait;
  dl.gameState.setPersona('mara.masked', { ...dl.personaTemplates['mara.masked'] });
  applyModule({ seed: 1, world: [[TILE.SAND]] }, { fullReset: true });
  applyModule({
    seed: 1,
    world: [[TILE.SAND]],
    personas: {
      'mara.masked': { label: 'Override Mara', portrait: 'assets/portraits/portrait_1005.png' },
      'new.mask': { label: 'New Mask', portrait: 'assets/portraits/portrait_1006.png' }
    }
  }, { fullReset: true });
  assert.strictEqual(dl.personaTemplates['mara.masked'].label, 'Override Mara');
  assert.strictEqual(dl.personaTemplates['mara.masked'].portrait, 'assets/portraits/portrait_1005.png');
  assert.deepStrictEqual(dl.personaTemplates['new.mask'], {
    id: 'new.mask',
    label: 'New Mask',
    portrait: 'assets/portraits/portrait_1006.png'
  });
  const personaState = dl.gameState.getState().personas;
  assert.strictEqual(personaState['mara.masked'].label, 'Override Mara');
  assert.strictEqual(personaState['mara.masked'].portrait, 'assets/portraits/portrait_1005.png');
  applyModule({ seed: 1, world: [[TILE.SAND]] }, { fullReset: true });
  assert.strictEqual(dl.personaTemplates['mara.masked'].label, baseLabel);
  assert.strictEqual(dl.personaTemplates['mara.masked'].portrait, basePortrait);
  assert.ok(!dl.personaTemplates['new.mask']);
  dl.gameState.setPersona('mara.masked', { ...dl.personaTemplates['mara.masked'] });
});

test('walking regenerates leader HP', async () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.length = 0; player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.hp = 5; hero.maxHp = 10;
  party.join(hero);
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
  party.join(hero);
  party.x = 0; party.y = 0;

  const firstMove = move(1,0);
  const baseDelay = getMoveDelay();
  await firstMove;

  addToInv({ id:'agi_charm', name:'AGI Charm', type:'trinket', mods:{ AGI:2 } });
  equipItem(0,0);

  const secondMove = move(1,0);
  const boostedDelay = getMoveDelay();
  assert.ok(boostedDelay < baseDelay);
  const expected = calcMoveDelay(getTile(state.map, party.x, party.y), hero);
  assert.strictEqual(boostedDelay, expected);
  await secondMove;
});

test('movement delay respects move_delay_mod equipment', async () => {
  const world = Array.from({ length:5 }, () => Array.from({ length:5 }, () => 7));
  applyModule({ world });
  state.map = 'world';
  party.length = 0;
  player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.stats.AGI = 4;
  party.join(hero);
  party.x = 0;
  party.y = 0;

  const firstMove = move(1,0);
  const baseDelay = getMoveDelay();
  await firstMove;

  addToInv({ id:'speed_charm', name:'Speed Charm', type:'trinket', mods:{ move_delay_mod:0.5 } });
  equipItem(0,0);

  const secondMove = move(1,0);
  const modDelay = getMoveDelay();
  assert.ok(modDelay < baseDelay);
  const expected = calcMoveDelay(getTile(state.map, party.x, party.y), hero);
  assert.strictEqual(modDelay, expected);
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
  assert.strictEqual(q.walkable,true);
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
  let hudCalls = 0;
  global.updateHUD = () => { hudCalls++; };
  const m = new Character('h','Healer','Role');
  m.hp = 5; m.maxHp = 10;
  party.join(m);
  const tonic = registerItem({ id:'tonic', name:'Tonic', type:'consumable', use:{ type:'heal', amount:3 } });
  addToInv(tonic);
  hudCalls = 0;
  useItem(0);
  assert.strictEqual(m.hp, 8);
  assert.strictEqual(player.hp, 8);
  assert.strictEqual(player.inv.length, 0);
  assert.ok(hudCalls >= 1);
});

test('useItem boosts stat temporarily', () => {
  party.length = 0; player.inv.length = 0; buffs.length = 0;
  const m = new Character('b','Booster','Role');
  m.stats.ATK = 1;
  party.join(m);
  const brew = registerItem({ id:'brew', name:'Battle Brew', type:'consumable', use:{ type:'boost', stat:'ATK', amount:2, duration:1, text:'You feel stronger.' } });
  addToInv(brew);
  const used = useItem(0);
  assert.ok(used);
  assert.strictEqual(m.stats.ATK, 3);
  assert.strictEqual(player.inv.length, 0);
  Effects.tick({ buffs });
  assert.strictEqual(m.stats.ATK, 1);
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
  party.join(a);
  party.join(b);
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
  const c = new Character('m','M','Wanderer');
  c.lvl = 3;
  c.skillPoints = 0;
  c.stats.STR += 2;
  c.special = ['POWER_STRIKE'];
  c._baseSpecial = ['POWER_STRIKE'];
  party.join(c);
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
  assert.deepStrictEqual(c.special, ['GUARD_UP']);
  assert.deepStrictEqual(c._baseSpecial, ['GUARD_UP']);
  assert.strictEqual(c.role, 'Wanderer');
});

test('respec allows choosing new specialization and quirk', () => {
  party.length = 0;
  player.inv.length = 0;
  const c = new Character('m','M','Scavenger');
  c.special = ['POWER_STRIKE'];
  c._baseSpecial = ['POWER_STRIKE'];
  c.quirk = 'Lucky Lint';
  c.lvl = 4;
  c.skillPoints = 0;
  party.join(c);
  setLeader(0);
  registerItem({ id:'memory_worm', name:'Memory Worm', type:'token' });
  addToInv('memory_worm');
  assert.notStrictEqual(findItemIndex('memory_worm'), -1);
  const ok = respec(0, { specialization: 'Cogwitch', quirk: 'Brutal Past' });
  assert.ok(ok);
  assert.strictEqual(findItemIndex('memory_worm'), -1);
  assert.strictEqual(c.role, 'Cogwitch');
  assert.strictEqual(c.quirk, 'Brutal Past');
  assert.deepStrictEqual(c.special, ['ADRENAL_SURGE']);
  assert.deepStrictEqual(c._baseSpecial, ['ADRENAL_SURGE']);
  const expected = baseStats();
  expected.INT += 1;
  expected.STR += 1;
  assert.deepStrictEqual(c.stats, expected);
  assert.strictEqual(c.skillPoints, 3);
});

test('bosses can drop memory worms', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m = new Character('p','P','Role');
  party.join(m);
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
  party.join(m);
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

test('advanceDialog costItem transitions to target node', () => {
  player.inv.length = 0;
  const coin = registerItem({ id: 'coin', name: 'Coin', type: 'quest' });
  addToInv(coin);
  const tree = {
    start: { text: '', next: [{ label: 'Pay', costItem: 'coin', to: 'next' }] },
    next: { text: '' }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.strictEqual(res.next, 'next');
  assert.strictEqual(dialog.node, 'next');
  assert.ok(!player.inv.some(it => it.id === 'coin'));
});

test('advanceDialog respects costSlot', () => {
  player.inv.length = 0;
  const trinket = registerItem({ id: 'river_trinket', name: 'Trinket', type: 'trinket' });
  addToInv(trinket);
  const tree = {
    start: { text: '', next: [ { label: 'Pay', costSlot: 'trinket', to: 'end' } ] },
    end: { text: '' }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(res.success);
  assert.ok(!player.inv.some(it => it.type === 'trinket'));
});

test('advanceDialog handles costTag', () => {
  player.inv.length = 0;
  registerItem({ id: 'iron_key', name: 'Iron Key', type: 'quest', tags: ['key'] });
  registerItem({ id: 'gem', name: 'Gem', type: 'quest' });
  addToInv({ id: 'iron_key' });
  const tree = {
    start: { text: '', next: [{ label: 'Unlock', costTag: 'key', reward: 'gem' }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(res.success);
  assert.ok(player.inv.some(it => it.id === 'gem'));
  assert.ok(!player.inv.some(it => it.tags.includes('key')));
});

test('advanceDialog honours reqSlot', () => {
  player.inv.length = 0;
  const token = registerItem({ id: 'fae_token', name: 'Fae Token', type: 'trinket' });
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
  assert.ok(player.inv.some(it => it.type === 'trinket'));
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

test('advanceDialog reqItem transitions to target node', () => {
  player.inv.length = 0;
  const key = registerItem({ id: 'magic_key', name: 'Magic Key', type: 'quest' });
  addToInv(key);
  const tree = {
    locked: { text: '', next: [{ label: 'Unlock', reqItem: 'magic_key', to: 'start' }] },
    start: { text: 'opened' }
  };
  const dialog = { tree, node: 'locked' };
  const res = advanceDialog(dialog, 0);
  assert.strictEqual(res.next, 'start');
  assert.strictEqual(dialog.node, 'start');
  assert.ok(player.inv.some(it => it.id === 'magic_key'));
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

test('advanceDialog uses reqTag without consuming and allows goto', () => {
  player.inv.length = 0;
  registerItem({ id: 'access_card', name: 'Access Card', type: 'quest', tags: ['pass'] });
  addToInv({ id: 'access_card' });
  state.map = 'world';
  party.x = 0; party.y = 0;
  const tree = {
    start: { text: '', next: [{ label: 'Enter', reqTag: 'pass', goto: { map: 'room', x: 9, y: 1 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(party.x, 9);
  assert.strictEqual(party.y, 1);
  assert.ok(player.inv.some(it => it.tags.includes('pass')));
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
  registerItem({ id: 'cursed_vr_helmet', name: 'Cursed VR Helmet', type: 'armor' });
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

test('quest tag turn-in handles partial counts', () => {
  player.inv.length = 0;
  const msgs = [];
  const origLog = global.log;
  global.log = m => msgs.push(m);
  registerItem({ id: 'ruby', name: 'Ruby', type: 'quest', tags: ['gem'] });
  registerItem({ id: 'emerald', name: 'Emerald', type: 'quest', tags: ['gem'] });
  registerItem({ id: 'sapphire', name: 'Sapphire', type: 'quest', tags: ['gem'] });
  addToInv({ id: 'ruby' });
  addToInv({ id: 'emerald' });
  const quest = new Quest('q_tag', 'Quest', '', { itemTag: 'gem', count: 3 });
  quest.status = 'active';
  questLog.add(quest);
  const npc = { quest };
  defaultQuestProcessor(npc, 'do_turnin');
  assert.strictEqual(quest.status, 'active');
  assert.strictEqual(quest.progress, 2);
  assert.strictEqual(countItems('gem'), 0);
  assert.ok(msgs.some(m => m.includes('Ruby')) && msgs.some(m => m.includes('Emerald')));
  addToInv({ id: 'sapphire' });
  defaultQuestProcessor(npc, 'do_turnin');
  assert.strictEqual(quest.status, 'completed');
  global.log = origLog;
  choicesEl.innerHTML = '';
});

test('quest turn-in enforces minimum XP baseline', () => {
  for (const k in quests) delete quests[k];
  NPCS.length = 0;
  party.length = 0;
  const char = new Character('g', 'Gil', 'Role');
  party.join(char);
  const quest = new Quest('q_xp', 'Quest', '', { xp: 4 });
  const npc = { quest };
  defaultQuestProcessor(npc, 'do_turnin');
  assert.strictEqual(char.xp, 10);
});

test('quest turn-in caps XP rewards at 100', () => {
  for (const k in quests) delete quests[k];
  NPCS.length = 0;
  party.length = 0;
  const char = new Character('g', 'Gil', 'Role');
  party.join(char);
  const quest = new Quest('q_xp_cap', 'Quest', '', { xp: 150 });
  const npc = { quest };
  defaultQuestProcessor(npc, 'do_turnin');
  assert.strictEqual(char.lvl, 2);
  assert.strictEqual(char.xp, 0);
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
  let labels = choicesEl.children.map(c => c.textContent.toLowerCase());
  assert.ok(!labels.some(l => l.includes('turn in')));

  // accept quest
  choicesEl.children[0].onclick();

  labels = choicesEl.children.map(c => c.textContent.toLowerCase());
  assert.ok(labels.some(l => l.includes('turn in')));
  closeDialog();
});

test('createNpcFactory builds NPCs from definitions', () => {
  const defs = [{
    id: 't',
    map: 'world',
    name: 'Tester',
    tree: '{"start":{"text":"hi","choices":[{"label":"bye","to":"bye"}]}}',
    portraitSheet: 'assets/portraits/portrait_1000.png',
    symbol: '?'
  }];
  const factory = createNpcFactory(defs);
  const npc = factory.t(2, 3);
  assert.strictEqual(npc.id, 't');
  assert.strictEqual(npc.x, 2);
  assert.strictEqual(npc.y, 3);
  assert.strictEqual(npc.map, 'world');
  assert.strictEqual(npc.tree.start.text, 'hi');
  assert.strictEqual(npc.portraitSheet, 'assets/portraits/portrait_1000.png');
  assert.strictEqual(npc.symbol, '?');
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

test('inanimate NPC defaults to dark green color', () => {
  const npc = makeNPC('obj', 'world', 0, 0, undefined, 'Obj', '', '', {} , null, null, null, { symbol: '?' });
  assert.strictEqual(npc.color, '#225a20');
  const npc2 = makeNPC('char', 'world', 0, 0, undefined, 'Char', '', '', {}, null, null, null, {});
  assert.strictEqual(npc2.color, '#9ef7a0');
});

test('openDialog displays portrait when sheet provided', () => {
  NPCS.length = 0;
  const tree = { start: { text: '', choices: [] } };
  const npc = makeNPC('p', 'world', 0, 0, '#fff', 'Port', '', '', tree, null, null, null, { portraitSheet: 'assets/portraits/kesh_4.png' });
  assert.strictEqual(npc.symbol, '!');
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
  dialogJoinParty({ id: 'j', name: 'Joker', role: 'Trickster' });
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
  globalThis.Dustland.actions.startCombat = () => { triggered = true; return Promise.resolve({ result: 'flee' }); };
  const npc = makeNPC('rival', 'world', 0, 0, '#fff', 'Rival', '', '', null, null, null, null, { combat: { DEF: 1 } });
  NPCS.push(npc);
  openDialog(npc);
  const fightBtn = [...choicesEl.children].find(c => c.textContent.startsWith('(Fight'));
  assert.ok(fightBtn.textContent.includes('XP'));
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
  const tree = {
    locked: { text: 'locked', choices: [{ label: '(Leave)', to: 'bye' }] },
    start: { text: '', choices: [{ label: '(Leave)', to: 'bye' }] },
    bye: { text: '', choices: [] }
  };
  applyModule({ npcs: [ { id: 'herm', map: 'world', x: 1, y: 1, name: 'Herm', locked: true, tree, hidden: true, reveal: { flag: 'visits@world@1,1', op: '>=', value: 2 } } ] });
  assert.strictEqual(NPCS.length, 0);
  setPartyPos(1,1);
  assert.strictEqual(NPCS.length, 0);
  setPartyPos(0,0);
  setPartyPos(1,1);
  assert.strictEqual(NPCS.length, 1);
  const herm = NPCS[0];
  assert.strictEqual(herm.id, 'herm');
  openDialog(herm);
  assert.strictEqual(textEl.textContent, 'locked');
  closeDialog();
  NPCS.length = 0;
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

test('resetAll clears world flags', () => {
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  worldFlags.demo = { count: 1, time: Date.now() };
  const origOpen = global.openCreator;
  global.openCreator = () => {};
  resetAll();
  global.openCreator = origOpen;
  assert.strictEqual(Object.keys(worldFlags).length, 0);
});
test('resetAll leaves saved game intact', () => {
  const store = { dustland_crt: '{}' };
  const origOpen = global.openCreator;
  const origLS = global.localStorage;
  global.openCreator = () => {};
  global.localStorage = {
    removeItem: k => { delete store[k]; },
    getItem: k => store[k] || null,
    setItem: (k, v) => { store[k] = v; }
  };
  resetAll();
  global.openCreator = origOpen;
  global.localStorage = origLS;
  assert.ok(store.dustland_crt, 'save should remain');
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
test('lock/unlock effects toggle npc access', () => {
  const tree = { locked:{ text:'locked', choices:[{ label:'(Leave)', to:'bye' }] }, start:{ text:'open', choices:[{ label:'(Leave)', to:'bye' }] }, bye:{ text:'', choices:[] } };
  const npc = makeNPC('ch', 'world', 0, 0, '#fff', 'Chest', '', '', tree);
  NPCS.length = 0;
  NPCS.push(npc);
  Effects.apply([{ effect: 'lockNPC', npcId: 'ch' }]);
  openDialog(npc);
  assert.strictEqual(textEl.textContent, 'locked');
  closeDialog();
  Effects.apply([{ effect: 'unlockNPC', npcId: 'ch' }]);
  openDialog(npc);
  assert.strictEqual(textEl.textContent, 'open');
  closeDialog();
  NPCS.length = 0;
});
test('lockNPC duration unlocks after time', async () => {
  const tree = { locked:{ text:'locked', choices:[{ label:'(Leave)', to:'bye' }] }, start:{ text:'open', choices:[{ label:'(Leave)', to:'bye' }] }, bye:{ text:'', choices:[] } };
  const npc = makeNPC('ch', 'world', 0, 0, '#fff', 'Chest', '', '', tree);
  NPCS.length = 0;
  NPCS.push(npc);
  Effects.apply([{ effect: 'lockNPC', npcId: 'ch', duration: 10 }]);
  openDialog(npc);
  assert.strictEqual(textEl.textContent, 'locked');
  closeDialog();
  await new Promise(r => setTimeout(r, 20));
  openDialog(npc);
  assert.strictEqual(textEl.textContent, 'open');
  closeDialog();
  NPCS.length = 0;
});
test('npcColor effect changes NPC color', () => {
  const npc = makeNPC('col', 'world', 0, 0, '#00ff00', 'Color', '', '', {});
  NPCS.length = 0;
  NPCS.push(npc);
  Effects.apply([{ effect: 'npcColor', npcId: 'col', color: '#ff0000' }]);
  assert.strictEqual(npc.color, '#ff0000');
  NPCS.length = 0;
});
test('dialog choice applies object effects', () => {
  globalThis.buildings = [ { interiorId: 'castle', boarded: true } ];
  const tree = { start:{ text:'hi', choices:[ { label:'open', to:'bye', effects:[ { effect:'unboardDoor', interiorId:'castle' } ] } ] }, bye:{ text:'', choices:[] } };
  const npc = makeNPC('f', 'world', 0, 0, '#fff', 'F', '', '', tree);
  NPCS.length = 0;
  NPCS.push(npc);
  openDialog(npc);
  choicesEl.children[0].onclick();
  closeDialog();
  assert.strictEqual(globalThis.buildings[0].boarded, false);
  globalThis.buildings.length = 0;
});
test('onEnter triggers effects and temporary stat mod', async () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.x=0; party.y=0;
  party.length=0;
  const hero = new Character('h','Hero','Role');
  party.join(hero);
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

test('space selects dialog choice', () => {
  NPCS.length = 0;
  const npc = { id: 'nav', name: 'Nav', tree: { start: { text: '', choices: [ { label: 'One' } ] } } };
  NPCS.push(npc);
  openDialog(npc);
  const picked = [];
  choicesEl.children[0].click = () => picked.push('One');

  handleDialogKey({ key: ' ' });

  assert.deepStrictEqual(picked, ['One']);
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
  members.slice(0,6).forEach(m=>assert.strictEqual(party.join(m), true));
  assert.strictEqual(party.join(members[6]), false);
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
  members.forEach(m=>party.join(m));

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
  party.join(base); party.join(recruit);
  assert.strictEqual(party.leave(base), false);
  assert.strictEqual(party.length, 2);
  assert.strictEqual(NPCS.length, 0);
});

test('removed member becomes NPC at current location', () => {
  party.length = 0; NPCS.length = 0;
  state.map = 'world'; party.map = 'world'; party.x = 0; party.y = 0;
  const base = new Character('a','A','Role', {permanent:true});
  const recruit = new Character('b','B','Role');
  party.join(base); party.join(recruit);
  assert.strictEqual(party.leave(recruit), true);
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
  party.join(m1);
  party.join(m2);
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
  party.join(m1);
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

test('bandits can drop scrap on defeat', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  player.scrap = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
  const origRand = Math.random;
  Math.random = () => 0;
  const resultPromise = openCombat([{ id:'bandit', name:'Bandit', hp:1 }]);
  handleCombatKey({ key:'Enter' });
  await resultPromise;
  Math.random = origRand;
  assert.strictEqual(player.scrap, 1);
});

test('npc scrap config drops scrap', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  player.scrap = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
  const origRand = Math.random;
  Math.random = () => 0;
  const resultPromise = openCombat([{ id:'rat', name:'Rat', hp:1, scrap:{ min:2, max:4 } }]);
  handleCombatKey({ key:'Enter' });
  await resultPromise;
  Math.random = origRand;
  assert.strictEqual(player.scrap, 2);
});

test('lootChance prevents drops on high rolls', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
  const origRand = Math.random;
  Math.random = () => 0.8;
  const resultPromise = openCombat([{ name:'E', hp:1, loot:{ id:'l', name:'L' }, lootChance:0.75 }]);
  handleCombatKey({ key:'Enter' });
  await resultPromise;
  Math.random = origRand;
  assert.strictEqual(player.inv.length, 0);
});

test('lootChance allows drops on low rolls', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
  const origRand = Math.random;
  Math.random = () => 0.5;
  const resultPromise = openCombat([{ name:'E', hp:1, loot:{ id:'l', name:'L' }, lootChance:0.75 }]);
  handleCombatKey({ key:'Enter' });
  await resultPromise;
  Math.random = origRand;
  assert.ok(player.inv.some(it => it.id === 'l'));
});

test('fallen party members are revived after combat', async () => {
  NPCS.length = 0;
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 1;
  party.join(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:3 }
  ]);

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'bruise');
  assert.strictEqual(party.length, 1);
  assert.ok(party[0].hp >= 1);
});

test('bruise resets map to entry', async () => {
  party.length = 0;
  player.inv.length = 0;
  state.map = 'whistle_room';
  party.map = 'whistle_room';
  party.x = 5; party.y = 5;
  state.mapEntry = { map: 'cavern', x: 2, y: 2 };
  interiors.cavern = { grid: [[0]], w:1, h:1 };
  const m1 = new Character('p1','P1','Role');
  m1.hp = 1;
  party.join(m1);

  const resultPromise = openCombat([
    { name: 'E1', hp: 3 }
  ]);

  handleCombatKey({ key: 'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'bruise');
  assert.strictEqual(state.map, 'cavern');
  assert.strictEqual(party.x, 2);
  assert.strictEqual(party.y, 2);
  state.map = 'world';
  party.map = 'world';
  state.mapEntry = null;
});

test('falling resets adrenaline', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 1;
  m1.adr = 30;
  party.join(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:3 }
  ]);

  handleCombatKey({ key:'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'bruise');
  assert.strictEqual(m1.adr, 0);
});

test('combat hp bars update after damage', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 2;
  m1.maxHp = 2;
  party.join(m1);

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

test('party adrenaline bar reflects adr percent', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 2;
  m1.maxHp = 2;
  m1.adr = 50;
  m1.maxAdr = 100;
  party.join(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:1, maxHp:1 }
  ]);

  const adr = combatParty.children[0].children[2];
  const fill = adr.children[0];
  assert.strictEqual(fill.style.width, '50%');
  if (typeof adr.getAttribute === 'function') {
    assert.strictEqual(adr.getAttribute('role'), 'progressbar');
    assert.strictEqual(adr.getAttribute('aria-valuenow'), '50');
    assert.strictEqual(adr.getAttribute('aria-valuemax'), '100');
    assert.strictEqual(adr.getAttribute('aria-valuemin'), '0');
  }

  handleCombatKey({ key:'Enter' });
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
  party.join(m1);

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
  party.join(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:1 }
  ]);

  combatClickHandler({ target: combatCmd.children[0] });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('space selects combat option', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);

  const resultPromise = openCombat([
    { name:'E1', hp:1 }
  ]);

  handleCombatKey({ key:' ' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('turn indicator updates with active member', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:['POWER_STRIKE'] });
  party.join(m1);
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  assert.strictEqual(turnIndicator.textContent, "P1's turn");
  closeCombat('flee');
  await resultPromise;
});

test('party member receives class special', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:['POWER_STRIKE'] });
  party.join(m1);
  await new Promise((r) => setTimeout(r, 50));
  assert.ok(m1.special.includes('POWER_STRIKE'));
});

test('special ids resolve to objects in combat', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:['POWER_STRIKE'] });
  party.join(m1);
  const resultPromise = openCombat([{ name:'E1', hp:1 }]);
  assert.strictEqual(typeof party[0].special[0], 'object');
  assert.strictEqual(party[0].special[0].id, 'POWER_STRIKE');
  closeCombat('flee');
  await resultPromise;
});

test('openCombat preserves adrenaline for party members', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.adr = 50;
  m1.maxAdr = 150;
  party.join(m1);
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
  party.join(m1);
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
  party.join(m1);
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

test('special applies cost and cooldown', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ id:'STRIKE', label:'Strike', dmg:2, adrCost:10, cooldown:2 }] });
  m1.adr = 20;
  party.join(m1);
  const resultPromise = openCombat([{ name:'E1', hp:5 }]);
  handleCombatKey({ key:'ArrowDown' });
  handleCombatKey({ key:'Enter' });
  const txt = combatCmd.children[0].textContent;
  assert.match(txt, /Strike \(10\)/);
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(m1.adr, 13);
  assert.strictEqual(m1.cooldowns.STRIKE, 1);
  openSpecialMenu();
  const txt2 = combatCmd.children[0].textContent;
  assert.match(txt2, /CD 1/);
  assert.ok(combatCmd.children[0].classList.contains('disabled'));
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
  party.join(m1);
  await move(1,0);
  assert.strictEqual(m1.adr, 18);
});

test('healAll restores HP and clears adrenaline', () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.hp = 5;
  m1.adr = 30;
  party.join(m1);
  healAll();
  assert.strictEqual(m1.hp, m1.maxHp);
  assert.strictEqual(m1.adr, 0);
});

test('startCombat forwards portrait fields', async () => {
  NPCS.length = 0;
  let captured;
  const orig = global.openCombat;
  global.openCombat = async (enemies) => { captured = enemies; return { result:'flee' }; };
  const defender = { name:'R', HP:5, portraitSheet:'img.png', portraitLock:false };
  const res = await global.startCombat(defender);
  global.openCombat = orig;
  assert.strictEqual(captured[0].portraitSheet, 'img.png');
  assert.strictEqual(captured[0].portraitLock, false);
  assert.strictEqual(res.result, 'flee');
});

test('save serializes party when map method is shadowed', () => {
  party.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
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
  assert.strictEqual(saved.format, 'dustland.save.v2');
  assert.strictEqual(saved.party.members[0].id, 'p1');
  assert.strictEqual(saved.party.members.length, 1);
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

test('save/load preserves persona assignments', () => {
  party.length = 0;
  const m1 = new Character('p1','P1','Role');
  party.join(m1);
  Dustland.gameState.setPersona('mask', { id:'mask', label:'Mask' });
  Dustland.gameState.applyPersona('p1','mask');
  const store = {};
  const orig = global.localStorage;
  global.localStorage = {
    setItem(k,v){ store[k]=v; },
    getItem(k){ return store[k]; },
    removeItem(k){ delete store[k]; }
  };
  save();
  party[0].persona = undefined;
  Dustland.gameState.updateState(s=>{ s.party = party; });
  load();
  global.localStorage = orig;
  assert.strictEqual(party[0].persona, 'mask');
});

test('save/load retains effect packs and persona boosts', () => {
  party.length = 0;
  party.flags = {};
  const member = new Character('p1', 'P1', 'Role');
  party.join(member);
  Dustland.gameState.updateState(s => { s.party = party; });
  const persona = { id: 'boost', label: 'Boost', mods: { STR: 2 } };
  Dustland.gameState.setPersona(persona.id, persona);
  Dustland.gameState.applyPersona('p1', persona.id);
  assert.strictEqual(party[0].stats.STR, 6);
  const effectPack = { 'test:event': [{ effect: 'addFlag', flag: 'charged' }] };
  Dustland.gameState.loadEffectPacks(effectPack);
  const store = {};
  const origStorage = global.localStorage;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k]; },
    removeItem(k){ delete store[k]; }
  };
  save();
  Dustland.gameState.updateState(s => {
    s.party = party;
    s.effectPacks = {};
    s.personas = {};
  });
  party[0].persona = undefined;
  delete party.flags.charged;
  const origBus = global.EventBus;
  const origDustBus = global.Dustland.eventBus;
  const listeners = new Map();
  const freshBus = {
    on(evt, handler){
      if(!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(handler);
    },
    off(evt, handler){
      listeners.get(evt)?.delete(handler);
    },
    emit(evt, payload){
      listeners.get(evt)?.forEach(fn => fn(payload));
    }
  };
  global.EventBus = freshBus;
  globalThis.EventBus = freshBus;
  global.Dustland.eventBus = freshBus;
  const origApply = Dustland.effects.apply;
  const applied = [];
  Dustland.effects.apply = (list, ctx) => {
    applied.push(JSON.parse(JSON.stringify(list)));
    return origApply.call(Dustland.effects, list, ctx);
  };
  try {
    load();
    const state = Dustland.gameState.getState();
    assert.strictEqual(party[0].persona, 'boost');
    assert.strictEqual(party[0].stats.STR, 6);
    assert.strictEqual(party[0]._bonus.STR, 2);
    assert.deepStrictEqual(state.effectPacks['test:event'], effectPack['test:event']);
    assert.deepStrictEqual(state.personas.boost, persona);
    delete party.flags.charged;
    EventBus.emit('test:event', { party });
    assert.ok(party.flags.charged);
    assert.strictEqual(applied.length, 1);
  } finally {
    Dustland.effects.apply = origApply;
    global.EventBus = origBus;
    globalThis.EventBus = origBus;
    global.Dustland.eventBus = origDustBus;
    global.localStorage = origStorage;
  }
});

test('save/load preserves enhanced weapon base ids', () => {
  const grid = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 7));
  applyModule({ world: grid, npcs: [] });
  player.inv.length = 0;
  party.length = 0;
  const member = new Character('pc', 'PC', 'Wanderer');
  party.join(member);
  const store = {};
  const origStorage = global.localStorage;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k]; },
    removeItem(k){ delete store[k]; }
  };
  try {
    registerItem({ id: 'artifact_blade', name: 'Artifact Blade', type: 'weapon', mods: { ADR: 8 } });
    registerItem({ id: 'enhanced_artifact_blade', name: 'Enhanced Artifact Blade', type: 'weapon', baseId: 'artifact_blade', mods: { ADR: 16 } });
    addToInv('enhanced_artifact_blade');
    assert.strictEqual(player.inv[0].baseId, 'artifact_blade');
    save();
    const saved = JSON.parse(store.dustland_crt);
    assert.strictEqual(saved.player.inv[0].baseId, 'artifact_blade');
    player.inv[0].baseId = undefined;
    loadModernSave(saved);
    const restored = player.inv.find(it => it.id === 'enhanced_artifact_blade');
    assert.ok(restored, 'enhanced weapon should reload');
    assert.strictEqual(restored.baseId, 'artifact_blade');
  } finally {
    player.inv.length = 0;
    party.length = 0;
    global.localStorage = origStorage;
  }
});

test('load bypasses legacy loader for v2 saves', async () => {
  const fixture = await fs.readFile(new URL('./fixtures/dustland.save.v2.json', import.meta.url), 'utf8');
  const store = { dustland_crt: fixture };
  const origStorage = global.localStorage;
  const origModern = global.loadModernSave;
  const origLegacy = global.loadLegacySave;
  let modernCalls = 0;
  let legacyCalls = 0;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k] ?? null; },
    removeItem(k){ delete store[k]; }
  };
  global.loadModernSave = () => { modernCalls++; };
  global.loadLegacySave = () => { legacyCalls++; };
  try {
    load();
    assert.strictEqual(modernCalls, 1);
    assert.strictEqual(legacyCalls, 0);
  } finally {
    global.loadModernSave = origModern;
    global.loadLegacySave = origLegacy;
    global.localStorage = origStorage;
  }
});

test('loadModernSave reloads the current module before patching state', () => {
  const moduleData = { name:'reload_mod', seed: 777, world:[[7,7],[7,7]] };
  applyModule(moduleData);
  const saved = {
    format: 'dustland.save.v2',
    module: JSON.stringify({ id:'reload_mod', name:'Reload Module' }),
    worldSeed: 777,
    world: [[7,7],[7,7]],
    player: { inv: [] },
    state: { map: 'world' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [],
    quests: {},
    party: { members: [], map: 'world', x: 1, y: 1, flags: {}, fallen: [] },
    worldFlags: {},
    bunkers: [],
    gameState: { difficulty: 'normal', flags: {}, clock: 0, personas: {}, npcMemory: {}, effectPacks: {} }
  };
  const store = {};
  const origStorage = global.localStorage;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k] ?? null; },
    removeItem(k){ delete store[k]; }
  };
  const origApply = globalThis.applyModule;
  const origDustApply = globalThis.Dustland.applyModule;
  const origCurrentModule = globalThis.Dustland.currentModule;
  const calls = [];
  function stubApply(data, opts){
    calls.push({ data, opts });
    return origApply(data, opts);
  }
  globalThis.applyModule = stubApply;
  globalThis.Dustland.applyModule = stubApply;
  globalThis.Dustland.currentModule = 'other_mod';
  try {
    global.localStorage.setItem('dustland_crt', JSON.stringify(saved));
    world.length = 0;
    world.push([1,1,1]);
    load();
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].opts?.fullReset, true);
    assert.deepStrictEqual(world, [[7,7],[7,7]]);
  } finally {
    globalThis.applyModule = origApply;
    globalThis.Dustland.applyModule = origDustApply;
    globalThis.Dustland.currentModule = origCurrentModule;
    global.localStorage = origStorage;
  }
});

test('loadModernSave can discard a mismatched saved world', () => {
  const moduleData = { name:'patch_prompt', seed: 9090, world:[[1,2],[3,4]] };
  applyModule(moduleData);
  const saved = {
    format: 'dustland.save.v2',
    module: 'patch_prompt',
    worldSeed: 9090,
    world: [[9,9],[9,9]],
    player: { inv: [] },
    state: { map: 'world' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [],
    quests: {},
    party: { members: [], map: 'world', x: 0, y: 0, flags: {}, fallen: [] },
    worldFlags: {},
    bunkers: [],
    gameState: { difficulty: 'normal', flags: {}, clock: 0, personas: {}, npcMemory: {}, effectPacks: {} }
  };
  const origConfirm = global.confirm;
  let prompt = '';
  let calls = 0;
  global.confirm = msg => { calls++; prompt = msg; return true; };
  try {
    loadModernSave(saved);
    assert.strictEqual(calls, 1);
    assert.match(prompt, /Discard the world/);
    assert.deepStrictEqual(world, [[1,2],[3,4]]);
  } finally {
    global.confirm = origConfirm;
  }
});

test('loadModernSave keeps the saved world when discard is cancelled', () => {
  const moduleData = { name:'keep_prompt', seed: 4545, world:[[0,0],[0,0]] };
  applyModule(moduleData);
  const saved = {
    format: 'dustland.save.v2',
    module: 'keep_prompt',
    worldSeed: 4545,
    world: [[5,5],[5,5]],
    player: { inv: [] },
    state: { map: 'world' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [],
    quests: {},
    party: { members: [], map: 'world', x: 1, y: 1, flags: {}, fallen: [] },
    worldFlags: {},
    bunkers: [],
    gameState: { difficulty: 'normal', flags: {}, clock: 0, personas: {}, npcMemory: {}, effectPacks: {} }
  };
  const origConfirm = global.confirm;
  let calls = 0;
  global.confirm = () => { calls++; return false; };
  try {
    loadModernSave(saved);
    assert.strictEqual(calls, 1);
    assert.deepStrictEqual(world, [[5,5],[5,5]]);
  } finally {
    global.confirm = origConfirm;
  }
});

test('loadModernSave restores bunkers and world flags', () => {
  const moduleData = { name:'flags_mod', seed: 4242, world:[[7,7],[7,7]] };
  applyModule(moduleData);
  const saved = {
    format: 'dustland.save.v2',
    module: 'flags_mod',
    worldSeed: 4242,
    world: [[7,7],[7,7]],
    player: { inv: [] },
    state: { map: 'world' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [],
    quests: {},
    party: { members: [], map: 'world', x: 2, y: 3, flags: {}, fallen: [] },
    worldFlags: { beacon: { lit: true }, storm: false },
    bunkers: [{ id: 'alpha', map: 'world', x: 5, y: 6, network: 'module:flags_mod' }],
    gameState: { difficulty: 'normal', flags: {}, clock: 0, personas: {}, npcMemory: {}, effectPacks: {} }
  };
  const store = {};
  const origStorage = global.localStorage;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k] ?? null; },
    removeItem(k){ delete store[k]; }
  };
  const dl = globalThis.Dustland;
  const origFastTravel = dl.fastTravel;
  const origBunkers = dl.bunkers;
  const inserted = [];
  dl.fastTravel = {
    upsertBunkers(list){
      dl.bunkers.push(...list.map(b => ({ ...b, fromUpsert: true })));
      inserted.push(...list.map(b => ({ ...b })));
      return dl.bunkers;
    }
  };
  dl.bunkers = [{ id: 'stale', map: 'world', x: 0, y: 0, network: 'old' }];
  const originalFlags = Object.entries(worldFlags).reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  worldFlags.temporary = { count: 9 };
  try {
    global.localStorage.setItem('dustland_crt', JSON.stringify(saved));
    load();
    assert.deepStrictEqual(worldFlags.beacon, { lit: true });
    assert.strictEqual(worldFlags.storm, false);
    assert.strictEqual(worldFlags.temporary, undefined);
    assert.ok(dl.bunkers.some(b => b.id === 'alpha'));
    assert.ok(inserted.some(b => b.id === 'alpha'));
    assert.ok(!dl.bunkers.some(b => b.id === 'stale'));
  } finally {
    dl.fastTravel = origFastTravel;
    dl.bunkers = origBunkers;
    Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
    Object.entries(originalFlags).forEach(([k, v]) => { worldFlags[k] = v; });
    global.localStorage = origStorage;
  }
});

test('loadModernSave ensures trader baseline goods return', () => {
  const moduleData = {
    name: 'shop_restore',
    seed: 2024,
    world: [[7, 7], [7, 7]],
    npcs: [
      {
        id: 'trader',
        map: 'world',
        x: 0,
        y: 0,
        shop: {
          markup: 1,
          refresh: 24,
          inv: [
            { id: 'pipe_rifle', rarity: 'common', cadence: 'daily', refreshHours: 24 },
            { id: 'minigun', rarity: 'legendary', cadence: 'weekly', refreshHours: 168 }
          ]
        }
      }
    ]
  };
  applyModule(moduleData);
  const saved = {
    format: 'dustland.save.v2',
    module: 'shop_restore',
    worldSeed: 2024,
    world: [[7, 7], [7, 7]],
    player: { inv: [] },
    state: { map: 'world' },
    buildings: [],
    interiors: {},
    itemDrops: [],
    npcs: [
      {
        id: 'trader',
        map: 'world',
        x: 0,
        y: 0,
        shop: {
          markup: 1,
          refresh: 24,
          inv: [
            { id: 'pipe_rifle', rarity: 'common', cadence: 'daily', refreshHours: 24 }
          ]
        }
      }
    ],
    quests: {},
    party: { members: [], map: 'world', x: 0, y: 0, flags: {}, fallen: [] },
    worldFlags: {},
    bunkers: [],
    gameState: { difficulty: 'normal', flags: {}, clock: 0, personas: {}, npcMemory: {}, effectPacks: {} }
  };
  loadModernSave(saved);
  const trader = NPCS.find(n => n.id === 'trader');
  assert.ok(trader);
  const invIds = Array.isArray(trader.shop?.inv) ? trader.shop.inv.map(entry => entry.id) : [];
  assert.ok(invIds.includes('minigun'));
  assert.strictEqual(invIds.filter(id => id === 'pipe_rifle').length, 1);
});

test('clearSave removes stored game data', () => {
  const store = { dustland_crt: '{}' };
  const orig = global.localStorage;
  let removed = false;
  global.localStorage = {
    setItem(k, v){ store[k] = v; },
    getItem(k){ return store[k]; },
    removeItem(k){ removed = true; delete store[k]; }
  };
  clearSave();
  assert.ok(removed);
  assert.strictEqual(store.dustland_crt, undefined);
  global.localStorage = orig;
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

test('encounters blocked within 3 tiles of roads', () => {
  const row = Array(20).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  applyModule({ world: [row], templates:[{ id:'test', name:'Test', combat:{ HP:1, ATK:1, DEF:0 }}], encounters: { world: [ { templateId:'test' } ] } });
  state.map = 'world';
  let started = false;
  const origRand = Math.random;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = () => { started = true; return Promise.resolve({ result: 'flee' }); };
  Math.random = () => 0;
  setPartyPos(2, 0); // within 3 tiles of road
  checkRandomEncounter();
  assert.ok(!started);
  setPartyPos(4, 0); // beyond 3 tiles
  checkRandomEncounter();
  Math.random = () => 1;
  checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.ok(started);
});

test('no encounters occur on roads', () => {
  const row = Array(2).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  applyModule({ world: [row], templates:[{ id:'test', name:'Test', combat:{ HP:1, ATK:1, DEF:0 }}], encounters: { world: [ { templateId:'test' } ] } });
  state.map = 'world';
  setPartyPos(0, 0);
  let started = false;
  const origRand = Math.random;
  Math.random = () => 0;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = () => { started = true; return Promise.resolve({ result: 'flee' }); };
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.ok(!started);
});

test('random encounters have a cooldown', async () => {
  const row = Array(10).fill(TILE.SAND);
  applyModule({ world: [row], templates:[{ id:'test', name:'Test', combat:{ HP:1, ATK:1, DEF:0 }}], encounters: { world: [ { templateId:'test' } ] } });
  state.map = 'world';
  setPartyPos(5, 0);
  let started = 0;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = () => { started++; return Promise.resolve({ result: 'flee' }); };
  const origRand = Math.random;
  Math.random = () => 0;
  await checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  await checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  Math.random = () => 1;
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.strictEqual(started, 2);
});

test('encounter templates forward portraitLock', async () => {
  const row = Array(10).fill(TILE.SAND);
  applyModule({
    world: [row],
    templates: [{ id: 'test', name: 'Test', portraitSheet: 'p.png', portraitLock: false, combat: { HP: 1, ATK: 1, DEF: 0 } }],
    encounters: { world: [{ templateId: 'test' }] }
  });
  state.map = 'world';
  encounterCooldown = 0;
  setPartyPos(5, 0);
  let captured;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = def => { captured = def; return Promise.resolve({ result: 'flee' }); };
  const origRand = Math.random;
  Math.random = () => 0;
  await checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.strictEqual(captured.portraitSheet, 'p.png');
  assert.strictEqual(captured.portraitLock, false);
  encounterCooldown = 0;
});

test('random encounters award XP based on strength', async () => {
  const row = Array(2).fill(TILE.SAND);
  applyModule({ world: [row], templates:[{ id:'test', name:'Test', combat:{ HP:4, ATK:1, DEF:0, challenge:4 }}], encounters: { world: [ { templateId:'test' } ] } });
  state.map = 'world';
  party.length = 0;
  party.push(makeMember('a','A','Hero'));
  party.push(makeMember('b','B','Mage'));
  setPartyPos(1, 0);
  const origRand = Math.random;
  Math.random = () => 0;
  const origOpen = global.openCombat;
  global.openCombat = async () => ({ result: 'loot' });
  await checkRandomEncounter();
  Math.random = () => 1;
  checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  Math.random = origRand;
  global.openCombat = origOpen;
  assert.strictEqual(party[0].xp, 4);
  assert.strictEqual(party[1].xp, 4);
  party.length = 0;
});

test('trivial enemies appear in groups', () => {
  const row = Array(10).fill(TILE.SAND);
  applyModule({ world: [row], templates:[{ id:'weak', name:'Weak', combat:{ HP:1, ATK:1, DEF:0 }}], encounters: { world: [ { templateId:'weak' } ] } });
  state.map = 'world';
  setPartyPos(5, 0);
  global.enemyTurnStats = { Weak: { total: 3, count: 3, quick: 3 } };
  let captured;
  const origRand = Math.random;
  Math.random = () => 0;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = def => { captured = def; return Promise.resolve({ result: 'flee' }); };
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  delete global.enemyTurnStats;
  encounterCooldown = 0;
  assert.strictEqual(captured.count, 3);
});

test('distant encounters use hard enemy pool', () => {
  const row = Array(30).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  const hard = { templateId: 'hard', minDist: 15 };
  applyModule({ world: [row], templates:[{ id:'soft', name:'Soft', combat:{ HP:1, ATK:1, DEF:0 } }, { id:'hard', name:'Hard', combat:{ HP:10, ATK:1, DEF:5 } }], encounters: { world: [ { templateId:'soft' }, hard ] } });
  state.map = 'world';
  setPartyPos(20, 0);
  let chosen = null;
  const origRand = Math.random;
  Math.random = () => 0;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = def => { chosen = def; return Promise.resolve({ result: 'flee' }); };
  checkRandomEncounter();
  Math.random = () => 1;
  checkRandomEncounter();
  checkRandomEncounter();
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.strictEqual(chosen.name, 'Hard');
});

test('enemies respect max distance', () => {
  const row = Array(10).fill(TILE.SAND);
  row[0] = TILE.ROAD;
  applyModule({ world: [row], templates:[{ id:'near', name:'Near', combat:{ HP:1, ATK:1, DEF:0 }}], encounters: { world: [ { templateId:'near', maxDist: 2 } ] } });
  state.map = 'world';
  setPartyPos(5, 0);
  let started = false;
  const origRand = Math.random;
  Math.random = () => 0;
  const origStart = globalThis.Dustland.actions.startCombat;
  globalThis.Dustland.actions.startCombat = () => { started = true; return Promise.resolve({ result: 'flee' }); };
  checkRandomEncounter();
  Math.random = origRand;
  globalThis.Dustland.actions.startCombat = origStart;
  assert.ok(!started);
});

test('enemy requires a specific weapon', () => {
  const enemy = { name: 'Shellback', hp: 10, requires: 'artifact_blade' };
  if(!getItem('artifact_blade')){
    registerItem({ id:'artifact_blade', name:'Artifact Blade', type:'weapon' });
  }
  const attacker = makeMember('a', 'A', 'Hero');
  attacker.equip = { weapon: { id: 'rusted_sword', mods: { ADR: 10 } } };
  const r = Math.random;
  const logs = [];
  const origLog = global.log;
  Math.random = () => 0;
  global.log = (msg) => { logs.push(msg); };
  try {
    __testAttack(attacker, enemy, 5);
    assert.strictEqual(enemy.hp, 10);
    assert.ok(logs.some(m => m.includes('Artifact Blade')));
    assert.ok(!logs.some(m => m.includes('artifact_blade')));
    logs.length = 0;
    attacker.equip.weapon.id = 'artifact_blade';
    __testAttack(attacker, enemy, 5);
    assert.strictEqual(enemy.hp, 8);
    enemy.hp = 10;
    logs.length = 0;
    attacker.equip.weapon = { id: 'enhanced_artifact_blade', baseId: 'artifact_blade', mods: { ADR: 10 } };
    __testAttack(attacker, enemy, 5);
    assert.strictEqual(enemy.hp, 8);
    assert.ok(!logs.some(m => m.includes("can't harm")));
  } finally {
    Math.random = r;
    global.log = origLog;
  }
});

// Broadcast fragments now live inside the Dustland module and are covered by broadcast tests.

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
  party.join(m1);
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
  m1.equip.trinket = { mods: { adrenaline_gen_mod: 2, granted_special: 'POWER_STRIKE' } };
  party.join(m1);
  const resultPromise = openCombat([{ name: 'E1', hp: 2 }]);
  assert.strictEqual(m1.special.length, 1);
  handleCombatKey({ key: 'Enter' });
  assert.strictEqual(m1.adr, 5);
  handleCombatKey({ key: 'Enter' });
  await resultPromise;
});

test('adrenaline boosts attack damage', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.adr = 100;
  party.join(m1);
  const resultPromise = openCombat([{ name: 'E1', hp: 3 }]);
  handleCombatKey({ key: 'Enter' });
  assert.strictEqual(combatState.enemies[0].hp, 1);
  handleCombatKey({ key: 'Enter' });
  await resultPromise;
});

test('adrenaline damage modifiers amplify boost', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role');
  m1.equip.trinket = { mods: { adrenaline_dmg_mod: 2 } };
  m1.adr = 100;
  party.join(m1);
  const resultPromise = openCombat([{ name: 'E1', hp: 3 }]);
  handleCombatKey({ key: 'Enter' });
  const res = await resultPromise;
  assert.strictEqual(res.result, 'loot');
});

test('enemy immune to basic attacks requires specials', async () => {
  party.length = 0;
  player.inv.length = 0;
  const m1 = new Character('p1','P1','Role', { special:[{ label:'Power Hit', dmg:2 }] });
  party.join(m1);
  const r = Math.random; Math.random = () => 0;
  const resultPromise = openCombat([{ name:'Shield', hp:5, immune:['basic'] }]);
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(combatState.enemies[0].hp, 5);
  handleCombatKey({ key:'ArrowDown' });
  handleCombatKey({ key:'Enter' });
  handleCombatKey({ key:'Enter' });
  assert.strictEqual(combatState.enemies[0].hp, 4);
  Math.random = r;
  closeCombat('flee');
  await resultPromise;
});

// --- Test: enemy counters basic attacks ---
test('enemy counters basic attacks', async () => {
  party.length = 0;
  player.inv.length = 0;

  const m1 = new Character('p1', 'P1', 'Role');
  party.join(m1);

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
  party.join(m1);

  const resultPromise = openCombat([{ name: 'E1', hp: 2 }]);

  // Player attacks twice; enemy should act in between/after depending on your loop
  handleCombatKey({ key: 'Enter' });
  handleCombatKey({ key: 'Enter' });

  await resultPromise;

  const logEntries = getCombatLog();
  assert.ok(logEntries.some(e => e.type === 'player' && e.action === 'attack'));
  assert.ok(logEntries.some(e => e.type === 'enemy' && e.action === 'attack'));
});

test('enemy targets weakest party member', async () => {
  NPCS.length = 0;
  party.length = 0;
  const m1 = new Character('p1', 'P1', 'Role');
  const m2 = new Character('p2', 'P2', 'Role');
  m1.hp = m1.maxHp = 5;
  m2.hp = m2.maxHp = 1;
  party.join(m1);
  party.join(m2);

  const resultPromise = openCombat([{ name: 'E1', hp: 3 }]);
  handleCombatKey({ key: 'Enter' }); // m1 attack
  handleCombatKey({ key: 'Enter' }); // m2 attack triggers enemy phase

  await new Promise(r => setTimeout(r));
  assert.strictEqual(m1.hp, 5);
  assert.strictEqual(m2.hp, 0);
  closeCombat('flee');
  await resultPromise;
});

test('nearby combat NPCs join combat', async () => {
  NPCS.length = 0;
  party.x = 0; party.y = 0; party.map = 'world';
  const npc1 = { id:'a', map:'world', x:0, y:0, name:'A', combat:{ HP:1 } };
  const npc2 = { id:'b', map:'world', x:1, y:0, name:'B', combat:{ HP:1 } };
  const npc3 = { id:'c', map:'world', x:5, y:5, name:'C', combat:{ HP:1 } };
  NPCS.push(npc1, npc2, npc3);
  let captured;
  const orig = global.openCombat;
  global.openCombat = async (enemies) => { captured = enemies; return { result:'flee' }; };
  await startCombat({ ...npc1.combat, npc:npc1, name:npc1.name });
  global.openCombat = orig;
  assert.strictEqual(captured.length, 2);
  assert.ok(captured.some(e => e.npc === npc1));
  assert.ok(captured.some(e => e.npc === npc2));
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

test('combat uses stats and equipment', () => {
  const origRand = Math.random;
  Math.random = () => 0;

  const hero = new Character('h', 'Hero', 'fighter');
  hero.stats.STR = 6;
  hero.equip.weapon = { id: 'club', type: 'weapon', mods: { ATK: 2 } };
  hero.equip.armor = { id: 'vest', type: 'armor', mods: { DEF: 2 } };
  hero.applyEquipmentStats();

  const dummy = { name: 'Dummy', hp: 10, DEF: 1 };
  __testAttack(hero, dummy, 1);
  assert.strictEqual(dummy.hp, 9);

  openCombat([{ name: 'Gob', hp: 5, ATK: 7 }]);
  enemyAttack();
  assert.strictEqual(hero.hp, hero.maxHp - 2);
  closeCombat('flee');

  Math.random = origRand;
});

test('registerZoneEffects overlays walled zones onto map tiles', () => {
  const baseX = 10;
  const baseY = 5;
  const width = 5;
  const height = 4;
  const grid = gridFor('world');
  assert.ok(Array.isArray(grid));
  const neededRows = baseY + height;
  const addedRows = [];
  while (grid.length <= neededRows) {
    const cols = grid[0]?.length || (baseX + width + 1);
    const row = Array.from({ length: cols }, () => TILE.SAND);
    grid.push(row);
    addedRows.push(row);
  }
  const neededCols = baseX + width;
  const extendedRows = [];
  const prevCells = [];
  for (const row of grid) {
    if (!Array.isArray(row)) continue;
    if (row.length <= neededCols) {
      extendedRows.push({ row, originalLength: row.length });
      while (row.length <= neededCols) {
        row.push(TILE.SAND);
      }
    }
  }
  assert.ok(Array.isArray(grid[0]));
  assert.ok(grid[0].length > baseX + width);
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const x = baseX + dx;
      const y = baseY + dy;
      prevCells.push({ x, y, value: grid[y][x] });
      grid[y][x] = TILE.SAND;
    }
  }
  const prevZones = globalThis.Dustland.zoneEffects.length;
  try {
    registerZoneEffects([{ map: 'world', x: baseX, y: baseY, w: width, h: height, walled: true, entrances: { south: true, west: true } }]);
    assert.deepStrictEqual(grid[baseY].slice(baseX, baseX + width), Array(width).fill(TILE.WALL));
    const expectedBottom = [TILE.WALL, TILE.SAND, TILE.SAND, TILE.WALL, TILE.WALL];
    assert.deepStrictEqual(grid[baseY + height - 1].slice(baseX, baseX + width), expectedBottom);
    const leftSide = [];
    const rightSide = [];
    for (let dy = 0; dy < height; dy++) {
      leftSide.push(grid[baseY + dy][baseX]);
      rightSide.push(grid[baseY + dy][baseX + width - 1]);
    }
    assert.deepStrictEqual(leftSide, [TILE.WALL, TILE.SAND, TILE.SAND, TILE.WALL]);
    assert.deepStrictEqual(rightSide, Array(height).fill(TILE.WALL));
    assert.strictEqual(grid[baseY + 1][baseX + 2], TILE.SAND);
  } finally {
    prevCells.forEach(({ x, y, value }) => { grid[y][x] = value; });
    while (addedRows.length) {
      const row = addedRows.pop();
      if (grid[grid.length - 1] === row) {
        grid.pop();
      }
    }
    extendedRows.forEach(({ row, originalLength }) => {
      if (row.length > originalLength) row.length = originalLength;
    });
    globalThis.Dustland.zoneEffects.length = prevZones;
  }
});
