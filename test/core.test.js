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

const { clamp, createRNG, Dice, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog, applyModule, findFreeDropTile, canWalk, move, openDialog, NPCS, itemDrops, setLeader, resolveCheck } = require('../dustland-core.js');

// Stub out globals used by equipment functions
global.log = () => {};
global.toast = () => {};
global.sfxTick = () => {};
global.renderInv = () => {};
global.renderParty = () => {};
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
  const cursed = normalizeItem({ name:'Mask', slot:'armor', cursed:true });
  addToInv(cursed);
  equipItem(0,0);
  assert.strictEqual(mem.equip.armor.name,'Mask');
  unequipItem(0,'armor');
  assert.ok(mem.equip.armor.cursed);
  assert.ok(mem.equip.armor.cursedKnown);
  assert.strictEqual(mem.equip.armor.name,'Mask');
});

test('equipping teleport item moves player', () => {
  party.length = 0;
  player.inv.length = 0;
  state.map = 'world';
  player.x = 0; player.y = 0;
  const mem = new Character('t2','Tele','Role');
  party.addMember(mem);
  const tp = normalizeItem({ name:'Warp Ring', slot:'trinket', equip:{ teleport:{ map:'world', x:5, y:6 } } });
  addToInv(tp);
  equipItem(0,0);
  assert.strictEqual(player.x,5);
  assert.strictEqual(player.y,6);
  assert.strictEqual(state.map,'world');
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
  addToInv({ name: 'Key' });
  const tree = {
    start: { text: '', next: [{ label: 'Use Key', costItem: 'Key', reward: 'Gem' }] }
  };
  const dialog = { tree, node: 'start' };
  const res = advanceDialog(dialog, 0);
  assert.ok(player.inv.some(it => it.name === 'Gem'));
  assert.ok(!player.inv.some(it => it.name === 'Key'));
  assert.ok(res.close);
});

test('advanceDialog respects goto with costItem', () => {
  player.inv.length = 0;
  addToInv({ name: 'Key' });
  state.map = 'world';
  player.x = 0; player.y = 0;
  const tree = {
    start: { text: '', next: [{ label: 'Go', costItem: 'Key', goto: { map: 'room', x: 3, y: 4 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(player.x, 3);
  assert.strictEqual(player.y, 4);
  assert.ok(!player.inv.some(it => it.name === 'Key'));
});

test('advanceDialog uses reqItem without consuming and allows goto', () => {
  player.inv.length = 0;
  addToInv({ name: 'Pass' });
  state.map = 'world';
  player.x = 1; player.y = 1;
  const tree = {
    start: { text: '', next: [{ label: 'Enter', reqItem: 'Pass', goto: { map: 'room', x: 5, y: 6 } }] }
  };
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  assert.strictEqual(player.x, 5);
  assert.strictEqual(player.y, 6);
  assert.ok(player.inv.some(it => it.name === 'Pass'));
});
