import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'modules', 'pit-bas.module.js');
const src = fs.readFileSync(file, 'utf8');

test('pit bas module initializes rooms and items', () => {
  const calls = [];
  const context = { Math };
  context.globalThis = context;
  context.mapLabels = { world: 'Wastes' };
  context.applyModule = data => {
    calls.push('apply');
    if (data.mapLabels) Object.assign(context.mapLabels, data.mapLabels);
  };
  context.setPartyPos = (x, y) => { context.pos = { x, y }; };
  context.setMap = (map, name) => {
    context.mapName = name || context.mapLabels[map] || 'Interior';
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
    assert.ok(context.PIT_BAS_MODULE.items.find(i => i.id === 'key'));
    const mace = context.PIT_BAS_MODULE.items.find(i => i.id === 'mace');
    const axe = context.PIT_BAS_MODULE.items.find(i => i.id === 'axe');
    assert.strictEqual(mace.type, 'weapon');
    assert.strictEqual(mace.slot, 'weapon');
    assert.strictEqual(axe.type, 'weapon');
    assert.strictEqual(axe.slot, 'weapon');
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
  assert.strictEqual(
    context.PIT_BAS_MODULE.mapLabels.whistle_room,
    'Whistle Room'
  );
  assert.strictEqual(
    context.PIT_BAS_MODULE.mapLabels.merchant_room,
    'Merchant Room'
  );
    assert.strictEqual(
      context.PIT_BAS_MODULE.mapLabels.flute_room,
      'Flute Room'
    );
    assert.strictEqual(
      context.PIT_BAS_MODULE.mapLabels.dead_end,
      'Dead End'
    );
    assert.strictEqual(
      context.PIT_BAS_MODULE.mapLabels.mirror_alice_room,
      'Mirror Alice Room'
    );
    const listing = Buffer.from(
      context.PIT_BAS_MODULE.listing,
      'base64'
    ).toString();
  assert.ok(listing.startsWith('0 COLOR 15'));
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
