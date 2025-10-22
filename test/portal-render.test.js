import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('portal layer renders above items', async () => {
  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const orderSnippet = code.match(/const renderOrder = \[[^\]]+\]/)[0];
  const renderOrder = vm.runInNewContext(orderSnippet + '; renderOrder;');
  assert.ok(renderOrder.includes('portals'));
  assert.ok(renderOrder.indexOf('portals') > renderOrder.indexOf('items'));
  assert.match(code, /layer\s*===\s*'portals'/);
});
