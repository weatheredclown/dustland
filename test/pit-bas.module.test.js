import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'modules', 'pit-bas.module.js');
const src = fs.readFileSync(file, 'utf8');
const questsFile = path.join(__dirname, '..', 'scripts', 'core', 'quests.js');
const questsSrc = fs.readFileSync(questsFile, 'utf8');

test('pit bas module initializes rooms and items', () => {
  const calls = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {
    calls.push('apply');
  };
  context.setPartyPos = (x, y) => { context.pos = { x, y }; };
  context.setMap = (map, name) => {
    const label =
      name ||
      context.PIT_BAS_MODULE.interiors.find(r => r.id === map)?.label ||
      'Interior';
    context.mapName = label;
  };
  context.log = () => { calls.push('log'); };
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad = () => { calls.push('post'); };
  context.startGame();
  assert.deepStrictEqual(calls, ['post', 'apply']);
  assert.deepStrictEqual(context.pos, { x: 2, y: 2 });
  assert.strictEqual(context.mapName, 'Cavern');
  assert.strictEqual(
    context.PIT_BAS_MODULE.items[0].id,
    'magic_lightbulb'
  );
    assert.ok(context.PIT_BAS_MODULE.items.find(i => i.id === 'whistle'));
    const key = context.PIT_BAS_MODULE.items.find(i => i.id === 'key');
    assert.ok(key && key.tags && key.tags.includes('key') && !key.map);
    const treasureIds = [
      'magic_lightbulb',
      'whistle',
      'silver_medallion',
      'mace',
      'axe',
      'canteen',
      'diamond_ring',
      'air_tanks',
      'sunglasses',
      'bright_sphere',
      'lightning_rod'
    ];
    treasureIds.forEach(id => {
      const it = context.PIT_BAS_MODULE.items.find(i => i.id === id);
      assert.ok(it && it.tags && it.tags.includes('treasure'));
    });
    const mace = context.PIT_BAS_MODULE.items.find(i => i.id === 'mace');
    const axe = context.PIT_BAS_MODULE.items.find(i => i.id === 'axe');
    assert.strictEqual(mace.type, 'weapon');
    assert.strictEqual(mace.slot, 'weapon');
    assert.strictEqual(axe.type, 'weapon');
    assert.strictEqual(axe.slot, 'weapon');
    const quest = context.PIT_BAS_MODULE.quests.find(q => q.id === 'q_treasure');
    assert.ok(quest);
    assert.strictEqual(quest.itemTag, 'treasure');
    assert.strictEqual(quest.count, 11);
    const merchant = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'merchant');
    assert.strictEqual(merchant.questId, 'q_treasure');
    assert.ok(merchant.tree.start.choices.some(c => c.q === 'turnin'));
    const gate = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'golden_gate_door');
    assert.ok(gate && gate.locked && gate.door);
    assert.ok(
      context.PIT_BAS_MODULE.portals.find(
        p => p.map === 'cavern' && p.toMap === 'whistle_room'
      )
    );
  assert.ok(
    context.PIT_BAS_MODULE.interiors.find(r => r.id === 'small_cavern')
  );
  assert.ok(
    context.PIT_BAS_MODULE.interiors.find(r => r.id === 'large_cavern')
  );
  assert.ok(
    context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'cavern' && p.toMap === 'small_cavern'
    )
  );
  assert.ok(
    context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'whistle_room' && p.toMap === 'dungeon'
    )
  );
    const smallReturn = context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'small_cavern' && p.toMap === 'cavern'
    );
    assert.deepStrictEqual(
      { x: smallReturn.x, y: smallReturn.y },
      { x: 2, y: 0 }
    );
    assert.ok(
      context.PIT_BAS_MODULE.portals.find(
        p => p.map === 'dungeon' && p.toMap === 'troll_room'
      )
    );
    assert.ok(
      context.PIT_BAS_MODULE.portals.find(
        p => p.map === 'troll_room' && p.toMap === 'dungeon'
      )
    );
    const beeToMerchant = context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'bee_room' && p.toMap === 'merchant_room'
    );
  assert.ok(beeToMerchant);
  const merchantToBee = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'merchant_room' && p.toMap === 'bee_room'
  );
  assert.ok(merchantToBee);
  const beeToFlute = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'bee_room' && p.toMap === 'flute_room'
  );
  assert.ok(beeToFlute);
  const fluteToBee = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'flute_room' && p.toMap === 'bee_room'
  );
  assert.ok(fluteToBee);
  const expectedRooms = [
    'cavern',
    'whistle_room',
    'small_cavern',
    'large_cavern',
    'golden_gate',
    'dungeon',
    'river_room',
    'glass_room',
    'bandit_room',
    'green_house',
    'river_bed',
    'troll_room',
    'trophy_room',
    'drain',
    'rag_room',
    'bright_room',
    'rapid_water',
    'pointless_room',
    'white_room',
    'shore',
    'whisper_room',
    'wizard_room',
    'roof_of_house',
    'alice_room',
    'lightning_room',
    'magician_book_room',
      'alice_room',
      'mirror_alice_room',
      'lightning_room',
      'magician_book_room',
    'air_room',
    'maze_small_room',
    'dead_end',
    'bee_room',
    'merchant_room',
    'flute_room',
    'north_south_passage',
    'in_a_box',
    'mirror_alice_room'
  ];
  expectedRooms.forEach(id => {
    assert.ok(context.PIT_BAS_MODULE.interiors.find(r => r.id === id));
  });
  assert.ok(
    context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'maze_small_room' && p.toMap === 'dead_end'
    )
  );
  assert.ok(
    context.PIT_BAS_MODULE.portals.find(
      p => p.map === 'dead_end' && p.toMap === 'maze_small_room'
    )
  );
  const getLabel = id =>
    context.PIT_BAS_MODULE.interiors.find(r => r.id === id)?.label;
  assert.strictEqual(getLabel('whistle_room'), 'Whistle Room');
  assert.strictEqual(getLabel('merchant_room'), 'Merchant Room');
  assert.strictEqual(getLabel('flute_room'), 'Flute Room');
  assert.strictEqual(getLabel('dead_end'), 'Dead End');
  assert.strictEqual(getLabel('mirror_alice_room'), 'Alice Room (Mirror)');
    const listing = Buffer.from(
      context.PIT_BAS_MODULE.listing,
      'base64'
    ).toString();
  assert.ok(listing.startsWith('0 COLOR 15'));
});

test('pit bas portals are not on walls', () => {
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = () => {};
  context.setMap = () => {};
  context.log = () => {};
  vm.runInNewContext(src, context);
  const mod = context.PIT_BAS_MODULE;
  const grids = Object.fromEntries(mod.interiors.map(i => [i.id, i.grid]));
  mod.portals.forEach(p => {
    const grid = grids[p.map];
    if (!grid) return;
    const tile = Array.from(grid[p.y])[p.x];
    assert.notStrictEqual(tile, '🧱', `portal on wall at ${p.map} (${p.x},${p.y})`);
  });
});

test('pit bas module logs entry message', () => {
  const logs = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = () => {};
  context.setMap = () => {};
  context.log = msg => { logs.push(msg); };
  vm.runInNewContext(src, context);
  context.startGame();
  assert.deepStrictEqual(logs, ['You land in a shadowy cavern.']);
});

test('pit bas module defines basic npcs', () => {
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = () => {};
  context.setMap = () => {};
  context.log = () => {};
  vm.runInNewContext(src, context);
  const ids = context.PIT_BAS_MODULE.npcs.map(n => n.id);
  const expected = [
    'bandit',
    'troll',
    'merchant',
    'golden_gate_door',
    'dead_adventurer',
    'bees',
    'wizard',
    'magician',
    'grue'
  ];
  expected.forEach(id => {
    assert.ok(ids.includes(id));
  });
  const bandit = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'bandit');
  const troll = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'troll');
  const bees = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'bees');
  const grue = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'grue');
  [bandit, troll, bees, grue].forEach(n => assert.ok(n.combat));
  const dead = context.PIT_BAS_MODULE.npcs.find(n => n.id === 'dead_adventurer');
  assert.ok(dead.tree.start.choices.some(c => c.label === '(Loot)'));
  assert.ok(dead.tree.loot.choices.some(c => c.reward === 'silver_medallion'));
});

test('merchant quest requires all treasures', () => {
  const modCtx = { Math };
  modCtx.globalThis = modCtx;
  vm.runInNewContext(src, modCtx);
  const moduleData = modCtx.PIT_BAS_MODULE;
  assert.ok(moduleData.quests && moduleData.quests.length);

  const game = {
    Math,
    interiors: {},
    buildings: [],
    portals: [],
    tileEvents: [],
    itemDrops: [],
    npcTemplates: [],
    enemyBanks: {},
    mapLabels: {},
    world: [],
    NPCS: [],
    hiddenNPCs: [],
    ITEMS: {},
    quests: {},
    party: [],
    player: { inv: [] },
    document: {
      dispatchEvent: () => {},
      defaultView: { CustomEvent: function(){}, Event: function(){} },
      createElement: () => ({ className: '', textContent: '', onclick: null, appendChild: () => {} })
    },
    window: {},
    EventBus: { on: () => {}, emit: () => {} },
    revealHiddenNPCs: () => {},
    log: () => {},
    renderQuests: () => {},
    queueNanoDialogForNPCs: () => {},
    flagValue: () => true,
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: () => {} },
    closeDialog: () => {},
    addToInv: () => {},
    removeFromInv: () => {},
    findItemIndex: () => -1,
    resolveItem: () => null,
    countItems: () => 0,
    awardXP: () => {},
    setRNGSeed: () => {},
    genWorld: () => {},
    gridFromEmoji: () => [],
    placeHut: () => {},
    registerTileEvents: () => {},
    registerZoneEffects: () => {},
    registerItem: def => def,
    makeNPC: (id, map, x, y, color, name, title, desc, tree, quest) => ({ id, map, x, y, color, name, title, desc, tree, quest }),
    getNextId: id => id,
  };
  game.globalThis = game;
  vm.runInNewContext(questsSrc, game);
  const coreFile = path.join(__dirname, '..', 'scripts', 'dustland-core.js');
  const coreSrc = fs.readFileSync(coreFile, 'utf8');
  const coreLines = coreSrc.split('\n');
  const applySrc = coreLines.slice(377, 528).join('\n');
  vm.runInNewContext(applySrc, game);
  game.applyModule(moduleData, { fullReset: false });

  const quest = game.quests['q_treasure'];
  assert.strictEqual(quest.itemTag, 'treasure');
  assert.strictEqual(quest.count, 11);
  const merchant = game.NPCS.find(n => n.id === 'merchant');
  game.defaultQuestProcessor(merchant, 'accept');
  game.defaultQuestProcessor(merchant, 'do_turnin');
  assert.strictEqual(quest.status, 'active');
  assert.strictEqual(quest.progress || 0, 0);
});

test('lightning room zaps without rod', () => {
  const logs = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = (x, y) => { context.pos = { x, y }; };
  context.setMap = map => { context.map = map; };
  context.log = msg => logs.push(msg);
  context.hasItem = () => false;
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad(context.PIT_BAS_MODULE);
  logs.length = 0;
  context.PIT_BAS_MODULE.effects.lightningZap();
  assert.deepStrictEqual(logs, [
    'A lightning bolt strikes! You tumble back to the cavern.'
  ]);
  assert.strictEqual(context.map, 'cavern');
  assert.deepStrictEqual(context.pos, { x: 2, y: 2 });
});

test('lightning rod deflects bolt', () => {
  const logs = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = () => {};
  context.setMap = () => {};
  context.log = msg => logs.push(msg);
  context.hasItem = id => id === 'lightning_rod';
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad(context.PIT_BAS_MODULE);
  logs.length = 0;
  context.PIT_BAS_MODULE.effects.lightningZap();
  assert.deepStrictEqual(logs, [
    'The lightning rod hums and deflects the bolt.'
  ]);
});

test('river bed requires air tanks', () => {
  const logs = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => {};
  context.setPartyPos = (x, y) => { context.pos = { x, y }; };
  context.setMap = map => { context.map = map; };
  context.log = msg => logs.push(msg);
  context.hasItem = () => false;
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad(context.PIT_BAS_MODULE);
  logs.length = 0;
  context.PIT_BAS_MODULE.effects.requireAirTanks();
  assert.deepStrictEqual(logs, ['You need air tanks to go underwater.']);
  assert.strictEqual(context.map, 'river_room');
  assert.deepStrictEqual(context.pos, { x: 0, y: 2 });
  const entries = context.PIT_BAS_MODULE.events.filter(e => e.map === 'river_bed');
  assert.ok(entries.some(e => e.x === 4 && e.y === 2));
  assert.ok(entries.some(e => e.x === 2 && e.y === 0));
  entries.forEach(e => {
    assert.ok(e.events.some(ev => ev.effect === 'requireAirTanks'));
  });
});

test('dark rooms can trigger grue attacks', () => {
  const logs = [];
  let foes;
  const context = { Math: { random: () => 0.4 } };
  context.globalThis = context;
  context.applyModule = () => {};
  context.openCombat = async enemies => {
    foes = enemies;
    return { result: 'flee' };
  };
  context.log = msg => logs.push(msg);
  context.hasItem = () => false;
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad(context.PIT_BAS_MODULE);
  logs.length = 0;
  context.PIT_BAS_MODULE.effects.darkGrueCheck();
  assert.deepStrictEqual(logs, [
    'It is dark. You are likely to be eaten by a grue.'
  ]);
  assert.ok(foes && foes[0].id === 'grue');
});

test('light prevents grue attacks', () => {
  const logs = [];
  let foes = null;
  const context = { Math: { random: () => 0.4 } };
  context.globalThis = context;
  context.applyModule = () => {};
  context.openCombat = async enemies => {
    foes = enemies;
    return { result: 'flee' };
  };
  context.log = msg => logs.push(msg);
  context.hasItem = id => id === 'magic_lightbulb';
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad(context.PIT_BAS_MODULE);
  logs.length = 0;
  context.PIT_BAS_MODULE.effects.darkGrueCheck();
  assert.deepStrictEqual(logs, []);
  assert.strictEqual(foes, null);
  const entries = context.PIT_BAS_MODULE.events.filter(e =>
    e.events.some(ev => ev.effect === 'darkGrueCheck')
  );
  assert.ok(entries.some(e => e.map === 'small_cavern'));
  assert.ok(entries.some(e => e.map === 'dungeon'));
});
