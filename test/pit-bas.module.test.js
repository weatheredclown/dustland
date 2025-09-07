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
  context.applyModule = () => { calls.push('apply'); };
  context.setPartyPos = (x, y) => { context.pos = { x, y }; };
  context.setMap = (map, name) => { context.mapName = name; };
  context.log = () => { calls.push('log'); };
  vm.runInNewContext(src, context);
  context.PIT_BAS_MODULE.postLoad = () => { calls.push('post'); };
  context.startGame();
  assert.deepStrictEqual(calls, ['post', 'apply']);
  assert.deepStrictEqual(context.pos, { x: 3, y: 5 });
  assert.strictEqual(context.mapName, 'PIT.BAS');
  assert.strictEqual(
    context.PIT_BAS_MODULE.items[0].id,
    'magic_lightbulb'
  );
  assert.ok(
    context.PIT_BAS_MODULE.items.find(i => i.id === 'whistle')
  );
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
  const smallReturn = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'small_cavern' && p.toMap === 'cavern'
  );
  assert.deepStrictEqual(
    { x: smallReturn.x, y: smallReturn.y },
    { x: 2, y: 0 }
  );
  const smallToLarge = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'small_cavern' && p.toMap === 'large_cavern'
  );
  assert.deepStrictEqual(
    { x: smallToLarge.x, y: smallToLarge.y },
    { x: 0, y: 2 }
  );
  const largeToSmall = context.PIT_BAS_MODULE.portals.find(
    p => p.map === 'large_cavern' && p.toMap === 'small_cavern'
  );
  assert.deepStrictEqual(
    { x: largeToSmall.x, y: largeToSmall.y },
    { x: 4, y: 1 }
  );
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
