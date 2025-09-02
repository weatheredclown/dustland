import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('tileChars and jitterColor provide ascii and color variation', async () => {
  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const snippet = code.match(/const tileChars[\s\S]*?globalThis.jitterColor = jitterColor;/)[0];
  const context = { globalThis: {} };
  vm.runInNewContext(snippet, context);
  const { tileChars, jitterColor } = context.globalThis;
  assert.strictEqual(tileChars[0], '.');
  const c1 = jitterColor('#112233', 0, 0);
  const c2 = jitterColor('#112233', 2, 3);
  const repeat = jitterColor('#112233', 0, 0);
  assert.notStrictEqual(c1, c2);
  assert.strictEqual(c1, repeat);
  assert.match(c1, /^rgb/);
});
