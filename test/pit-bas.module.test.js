import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'modules', 'pit-bas.module.js');
const src = fs.readFileSync(file, 'utf8');

test('pit bas module initializes cavern and lightbulb', () => {
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
  assert.strictEqual(context.PIT_BAS_MODULE.items[0].id, 'magic_lightbulb');
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
