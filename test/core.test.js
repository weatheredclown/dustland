const assert = require('assert');
const { test } = require('node:test');

function stubEl(){
  const el = {
    style:{},
    classList:{ toggle: ()=>{}, add: ()=>{}, remove: ()=>{} },
    textContent:'',
    onclick:null,
    _innerHTML:'',
    children:[],
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    parentElement:{ appendChild:()=>{}, querySelectorAll:()=>[] }
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

global.window = global;
const overlay = stubEl();
const choicesEl = stubEl();
const dialogText = stubEl();
const npcName = stubEl();
const npcTitle = stubEl();
const portEl = stubEl();
global.document = {
  getElementById: (id) => ({
    overlay,
    choices: choicesEl,
    dialogText,
    npcName,
    npcTitle,
    port: portEl
  })[id] || stubEl(),
  createElement: () => stubEl()
};

const { clamp, createRNG, Dice, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog, applyModule, createNpcFactory, findFreeDropTile, canWalk, move, openDialog, NPCS, itemDrops, setLeader, resolveCheck, queryTile, interactAt, registerItem } = require('../dustland-core.js');

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

test('Dice.roll is within inclusive bounds', () => {
  for(let i=0;i<100;i++){
    const roll = Dice.roll(6);
    assert.ok(roll >= 1 && roll <= 6);
  }
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

test('equipping teleport item moves player and logs message', () => {
  const oldLog = global.log;
  const oldCenter = global.centerCamera;
  const logs = [];
  let centered = null;
  global.log = (msg) => logs.push(msg);
  global.centerCamera = (x, y, map) => { centered = { x, y, map }; };

  party.length = 0;
  player.inv.length = 0;
  state.map = 'world';
  player.x = 0; player.y = 0;
  const mem = new Character('t2','Tele','Role');
  party.addMember(mem);
  const tp = normalizeItem({ id:'warp_ring', name:'Warp Ring', type:'trinket', slot:'trinket', equip:{ teleport:{ map:'world', x:5, y:6 }, msg:'whoosh' } });
  addToInv(tp);
  equipItem(0,0);
  assert.strictEqual(player.x,5);
  assert.strictEqual(player.y,6);
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
  player.x=0; player.y=0;
  assert.strictEqual(canWalk(1,0), false);
  move(1,0);
  assert.strictEqual(player.x,0);
});

test('queryTile reports entities and items', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  applyModule({world});
  state.map='world';
  player.x=0; player.y=0;
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
  player.x=0; player.y=0;
  itemDrops.length=0; player.inv.length=0;
  registerItem({id:'gem',name:'Gem',type:'quest'});
  const itm={id:'gem',map:'world',x:1,y:0};
  itemDrops.push(itm);
  interactAt(1,0);
  assert.ok(player.inv.some(it=>it.id==='gem'));
  assert.ok(!itemDrops.includes(itm));
});

test('findFreeDropTile avoids water and player tiles', () => {
  const W=120, H=90;
  const world = Array.from({length:H},()=>Array.from({length:W},()=>7));
  world[10][10] = 2; // water
  applyModule({world});
  state.map='world';
  player.x=0; player.y=0;
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
  player.x=0; player.y=0;
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
  registerItem({id:'key',name:'Key',type:'quest'});
  registerItem({id:'gem',name:'Gem',type:'quest'});
  addToInv('key');
  const tree = {
    start: { text: '', next: [{ label: 'Use Key', costItem: 'key', reward: 'gem' }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(player.inv.some(it => it.id === 'gem'));
  assert.ok(!player.inv.some(it => it.id === 'key'));
  assert.ok(res.close);
});

test('advanceDialog respects goto with costItem', () => {
  player.inv.length = 0;
  registerItem({id:'key',name:'Key',type:'quest'});
  addToInv('key');
  state.map = 'world';
  player.x = 0; player.y = 0;
  const tree = {
    start: { text: '', next: [{ label: 'Go', costItem: 'key', goto: { map: 'room', x: 3, y: 4 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(player.x, 3);
  assert.strictEqual(player.y, 4);
  assert.ok(!player.inv.some(it => it.id === 'key'));
});

test('advanceDialog uses reqItem without consuming and allows goto', () => {
  player.inv.length = 0;
  registerItem({id:'pass',name:'Pass',type:'quest'});
  addToInv('pass');
  state.map = 'world';
  player.x = 1; player.y = 1;
  const tree = {
    start: { text: '', next: [{ label: 'Enter', reqItem: 'pass', goto: { map: 'room', x: 5, y: 6 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(player.x, 5);
  assert.strictEqual(player.y, 6);
  assert.ok(player.inv.some(it => it.id === 'pass'));
});

test('advanceDialog matches reqItem case-insensitively', () => {
  player.inv.length = 0;
  registerItem({id:'access_card',name:'access card',type:'quest',tags:['pass']});
  addToInv('access_card');
  state.map = 'world';
  player.x = 2; player.y = 2;
  const tree = {
    start: { text: '', next: [{ label: 'Up', reqItem: 'PASS', goto: { map: 'room', x: 7, y: 8 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(player.x, 7);
  assert.strictEqual(player.y, 8);
});

test('door portals link interiors', () => {
  const world = Array.from({length:5},()=>Array.from({length:5},()=>7));
  const forest = { id:'forest', w:3, h:3, grid:[[6,6,6],[6,8,6],[6,6,6]], entryX:1, entryY:1 };
  const castle = { id:'castle', w:3, h:3, grid:[[6,6,6],[6,8,6],[6,6,6]], entryX:1, entryY:1 };
  applyModule({world, interiors:[forest, castle], portals:[{ map:'forest', x:1, y:1, toMap:'castle', toX:1, toY:1 },{ map:'castle', x:1, y:1, toMap:'forest', toX:1, toY:1 }]});
  state.map='forest'; player.x=1; player.y=1;
  interactAt(1,1);
  assert.strictEqual(state.map, 'castle');
  interactAt(1,1);
  assert.strictEqual(state.map, 'forest');
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
