import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

function loadModuleSrc() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  return fs.readFileSync(file, 'utf8');
}

function loadModuleData() {
  const src = loadModuleSrc();
  const DATA_START = 'const DATA = `\n';
  const start = src.indexOf(DATA_START) + DATA_START.length;
  const end = src.indexOf('`', start);
  return JSON.parse(src.slice(start, end));
}

test('dustland module includes patrolling enemy', () => {
  const data = loadModuleData();
  const npc = data.npcs.find(n => n.id === 'stalker_patrol');
  assert.ok(npc);
  assert.strictEqual(npc.portraitSheet, 'assets/portraits/portrait_1079.png');
  assert.deepStrictEqual(npc.loop, [
    { x: 90, y: 47 },
    { x: 110, y: 47 },
    { x: 110, y: 39 },
    { x: 90, y: 39 }
  ]);
  assert.deepStrictEqual(npc.combat, { HP: 7, ATK: 2, DEF: 1, loot: 'raider_knife', auto: true });
});

test('dustland module includes plot improvements', () => {
  const data = loadModuleData();
  const sign = data.npcs.find(n => n.id === 'road_sign');
  assert.ok(sign);
  assert.ok(sign.tree.start.text.includes('Rust storms east'));
  assert.strictEqual(sign.symbol, '?');
  assert.strictEqual(sign.color, '#225a20');
  const rumor = data.npcs.some(n => Object.values(n.tree || {}).some(node => node.text && node.text.includes('Radio crackles from the north; idol whispers from the south')));
  assert.ok(rumor);
});

test('dustland module warns about hall monster', () => {
  const src = loadModuleSrc();
  const context = {
    WORLD_H: 90,
    WORLD_W: 120,
    TILE: { WALL: 1, FLOOR: 2, DOOR: 3 },
    DC: { TALK: 10 },
    CURRENCY: 's',
    player: { scrap: 0 },
    addToInv: () => {},
    renderInv: () => {},
    renderQuests: () => {},
    renderParty: () => {},
    updateHUD: () => {},
    NPCS: [],
    log: () => {},
    rng: Math.random,
    removeNPC: () => {},
    SpoilsCache: { create: () => null },
    itemDrops: [],
    registerItem: () => {},
    EventBus: { emit: () => {} },
    party: { map: 'world', x: 0, y: 0 },
    setMap: () => {},
    setPartyPos: () => {}
  };
  vm.runInNewContext(src, context);
  context.DUSTLAND_MODULE.postLoad(context.DUSTLAND_MODULE);
  context.NPCS.push({ id: 'hall_rotwalker' });
  const exitdoor = context.DUSTLAND_MODULE.npcs.find(n => n.id === 'exitdoor');
  exitdoor.processNode('start');
  assert.ok(exitdoor.tree.start.text.includes('rotwalker at the top of the hall'));
});

test('workshop building includes workbench NPC', () => {
  const data = loadModuleData();
  const building = data.buildings.find(b => b.interiorId === 'workshop');
  assert.ok(building);
  const npc = data.npcs.find(n => n.id === 'workbench');
  assert.ok(npc);
  assert.strictEqual(npc.map, 'workshop');
  const hasCraft = npc.tree?.start?.choices?.some(c => c.label.includes('Craft signal beacon'));
  assert.ok(hasCraft);
});

test('medkit heals for 10 HP', () => {
  const data = loadModuleData();
  const med = data.items.find(i => i.id === 'medkit');
  assert.strictEqual(med.use?.amount, 10);
});
