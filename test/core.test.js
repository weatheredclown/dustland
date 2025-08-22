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
const combatCmd = stubEl();
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
    combatCmd
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

const { clamp, createRNG, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog, applyModule, createNpcFactory, findFreeDropTile, canWalk, move, openDialog, closeDialog, NPCS, itemDrops, setLeader, resolveCheck, queryTile, interactAt, registerItem, getItem, setRNGSeed, useItem, registerTileEvents, buffs, handleDialogKey, worldFlags, makeNPC, Effects, openCombat, handleCombatKey, uncurseItem, save, makeInteriorRoom, placeHut, TILE, getTile, interiors, calcMoveDelay, getMoveDelay } = globalThis;

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
    registerItem({ id:'apple', name:'Apple' });
    addToInv('apple');
    assert.ok(player.inv.some(it=>it.id==='apple'));
  });

  test('picking up an item logs once', () => {
    player.inv.length = 0;
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

test('walking regenerates leader HP', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  party.length = 0; player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.hp = 5; hero.maxHp = 10;
  party.addMember(hero);
  party.x = 0; party.y = 0;

  move(1,0);
  assert.strictEqual(hero.hp, 6);
  assert.strictEqual(player.hp, 6);

  hero.hp = 9; player.hp = 9;
  move(1,0);
  assert.strictEqual(hero.hp, 10);
  assert.strictEqual(player.hp, 10);

  move(1,0);
  assert.strictEqual(hero.hp, 10);
  assert.strictEqual(player.hp, 10);
});

test('movement delay improves with agility and equipment', () => {
  const world = Array.from({ length:5 }, () => Array.from({ length:5 }, () => 7));
  applyModule({ world });
  state.map = 'world';
  party.length = 0;
  player.inv.length = 0;
  const hero = new Character('h', 'Hero', 'Role');
  hero.stats.AGI = 4;
  party.addMember(hero);
  party.x = 0; party.y = 0;

  move(1,0);
  const baseDelay = getMoveDelay();

  addToInv({ id:'agi_charm', name:'AGI Charm', type:'trinket', slot:'trinket', mods:{ AGI:2 } });
  equipItem(0,0);

  move(1,0);
  const boostedDelay = getMoveDelay();
  assert.ok(boostedDelay < baseDelay);
  const expected = calcMoveDelay(getTile(state.map, party.x, party.y), hero);
  assert.strictEqual(boostedDelay, expected);
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

test('advanceDialog returns success flag on failure', () => {
  const tree = {
    start: { text: '', next: [{ label: 'Fail', check: { stat: 'str', dc: 999 } }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.strictEqual(res.success, false);
});

test('once choice not consumed on failed check', () => {
  globalThis.usedOnceChoices.clear();
  const npc = { id: 'tester', name: 'Tester', tree: { start: { text: '', next: [{ label: 'Try', once: true, check: { stat: 'str', dc: 999 }, failure: 'nope' }] } } };
  openDialog(npc);
  const key = 'tester::start::Try';
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

test('turn-in choice hidden until quest accepted', () => {
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
  choicesEl.children[0].onclick(); // accept
  choicesEl.children[0].onclick(); // bye

  openDialog(npc);
  labels = choicesEl.children.map(c => c.textContent);
  assert.ok(labels.includes('turn in'));
});

test('createNpcFactory builds NPCs from definitions', () => {
  const defs = [{
    id: 't',
    map: 'world',
    name: 'Tester',
    tree: '{"start":{"text":"hi","choices":[{"label":"bye","to":"bye"}]}}'
  }];
  const factory = createNpcFactory(defs);
  const npc = factory.t(2, 3);
  assert.strictEqual(npc.id, 't');
  assert.strictEqual(npc.x, 2);
  assert.strictEqual(npc.y, 3);
  assert.strictEqual(npc.map, 'world');
  assert.strictEqual(npc.tree.start.text, 'hi');
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

test('clamp swaps reversed bounds', () => {
  assert.strictEqual(clamp(5, 10, 0), 5);
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
  const orig = Actions.startCombat;
  let triggered = false;
  Actions.startCombat = () => { triggered = true; };
  const npc = makeNPC('rival', 'world', 0, 0, '#fff', 'Rival', '', '', null, null, null, null, { combat: { DEF: 1 } });
  NPCS.push(npc);
  openDialog(npc);
  const fightBtn = choicesEl.children.find(c => c.textContent === '(Fight)');
  fightBtn.onclick();
  assert.ok(triggered);
  Actions.startCombat = orig;
});

test('leave choice is rendered last', () => {
  NPCS.length = 0;
  const tree = { start: { text: '', choices: [ { label: 'Leave', to: 'bye' }, { label: 'Talk', to: 'talk' } ] }, talk: { text: '', choices: [] }, bye: { text: '', choices: [] } };
  const npc = makeNPC('l', 'world', 0, 0, '#fff', 'L', '', '', tree);
  NPCS.push(npc);
  openDialog(npc);
  const labels = choicesEl.children.map(c => c.textContent);
  assert.strictEqual(labels[labels.length - 1], 'Leave');
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
test('onEnter triggers effects and temporary stat mod', () => {
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
  move(1,0);
  assert.strictEqual(party.x,1);
  assert.ok(msgs.includes('You smell rot.'));
  assert.strictEqual(party[0].stats.CHA,3);
  move(1,0);
  assert.strictEqual(party[0].stats.CHA,3);
  move(1,0);
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

test('combat overlay sits behind the log panel', async () => {
  const css = await fs.readFile(new URL('../dustland.css', import.meta.url), 'utf8');
  assert.match(css, /\.panel\s*{[\s\S]*z-index:\s*15/);
  assert.match(css, /#combatOverlay\s*{[\s\S]*z-index:\s*10/);
});
