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
  const MARKER = 'const DATA = `';
  const start = src.indexOf(MARKER);
  const end = src.indexOf('`', start + MARKER.length);
  return JSON.parse(src.slice(start + MARKER.length, end));
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
  assert.ok(npc.workbench);
});

test('workshop no longer stores power cells', () => {
  const data = loadModuleData();
  const cell = data.items.find(i => i.id === 'power_cell');
  assert.ok(!cell);
});

test('medkit heals for 10 HP', () => {
  const data = loadModuleData();
  const med = data.items.find(i => i.id === 'medkit');
  assert.strictEqual(med.use?.amount, 10);
});

test('cloth supplies can be found to the south', () => {
  const data = loadModuleData();
  const cloth = data.items.find(i => i.id === 'cloth');
  assert.ok(cloth);
  assert.strictEqual(cloth.map, 'world');
  assert.ok(cloth.y > 60);
});

test('plant fiber can be scavenged', () => {
  const data = loadModuleData();
  const fiber = data.items.find(i => i.id === 'plant_fiber');
  assert.ok(fiber);
  assert.strictEqual(fiber.map, 'world');
});

test('bandage heals more than water flask', () => {
  const data = loadModuleData();
  const bandage = data.items.find(i => i.id === 'bandage');
  const flask = data.items.find(i => i.id === 'water_flask');
  assert.ok(bandage.use.amount > flask.use.amount);
});

test('vine creature drops plant fiber', () => {
  const data = loadModuleData();
  const template = data.templates.find(t => t.id === 'vine_creature');
  assert.ok(template);
  const encounter = data.encounters.world.find(e => e.templateId === 'vine_creature');
  assert.ok(encounter);
  assert.strictEqual(encounter.loot, 'plant_fiber');
});

test('northeast hut has portal to hall', () => {
  const data = loadModuleData();
  const hut = data.buildings.find(b => b.interiorId === 'portal_hut');
  assert.ok(hut);
  assert.ok(hut.x >= 117 && hut.y === 0);
  const portal = data.portals.find(p => p.map === 'portal_hut' && p.toMap === 'hall');
  assert.ok(portal);
});

test('trader patrols east-west with basic goods', () => {
  const data = loadModuleData();
  const trader = data.npcs.find(n => n.id === 'trader');
  assert.ok(trader);
  assert.deepStrictEqual(trader.loop, [
    { x: 10, y: 44 },
    { x: 110, y: 44 }
  ]);
  const invIds = trader.shop?.inv?.map(i => i.id);
  assert.deepStrictEqual(invIds, ['pipe_rifle', 'leather_jacket', 'water_flask']);
});
