import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

test('lootbox demo startGame runs postLoad before applying module', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'lootbox-demo.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const calls = [];
  const context = { Math };
  context.globalThis = context;
  context.applyModule = () => { calls.push('apply'); };
  context.setFlag = () => {};
  context.setPartyPos = () => {};
  context.setMap = () => {};
  context.makeNPC = () => ({}) ;
  context.NPCS = [];
  vm.runInNewContext(src, context);
  context.LOOTBOX_DEMO_MODULE.postLoad = () => { calls.push('post'); };
  context.startGame();
  assert.deepStrictEqual(calls, ['post', 'apply']);
});
