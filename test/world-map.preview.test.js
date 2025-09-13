import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('renderThumb converts string rows to grid', async () => {
  const document = makeDocument();
  const context = { document, window: { document }, Dustland: {} };
  context.gridFromEmoji = rows => rows.map(r => Array.from(r).map(() => 1));
  vm.createContext(context);
  let code = await fs.readFile(new URL('../scripts/ui/world-map.js', import.meta.url), 'utf8');
  code = code.replace('function renderThumb', 'globalThis.renderThumb = function renderThumb');
  vm.runInContext(code, context);
  const data = { world: ['aa', 'bb'] };
  const canvas = context.renderThumb(data);
  assert.strictEqual(canvas.width, 2);
  assert.strictEqual(canvas.height, 2);
  assert.ok(Array.isArray(data.world[0]));
});
