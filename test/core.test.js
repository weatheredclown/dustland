const assert = require('assert');
const { test } = require('node:test');

function stubEl(){
  return {
    style:{},
    classList:{ toggle: ()=>{} },
    textContent:'',
    onclick:null,
    querySelector: () => stubEl()
  };
}

global.window = global;
global.document = {
  getElementById: () => stubEl(),
  createElement: () => stubEl()
};

const { clamp, createRNG, Dice, addToInv, equipItem, unequipItem, normalizeItem, player, party, state, Character, advanceDialog } = require('../dustland-core.js');

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
