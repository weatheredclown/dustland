import { strict as assert } from 'node:assert';
import test from 'node:test';

test('broadcast fragment modules expose globals', async () => {
  delete globalThis.BROADCAST_FRAGMENT_1;
  delete globalThis.BROADCAST_FRAGMENT_2;
  delete globalThis.BROADCAST_FRAGMENT_3;
  await import('../modules/broadcast-fragment-1.module.js');
  await import('../modules/broadcast-fragment-2.module.js');
  await import('../modules/broadcast-fragment-3.module.js');
  assert.ok(globalThis.BROADCAST_FRAGMENT_1);
  assert.ok(globalThis.BROADCAST_FRAGMENT_2);
  assert.ok(globalThis.BROADCAST_FRAGMENT_3);
  [
    globalThis.BROADCAST_FRAGMENT_1,
    globalThis.BROADCAST_FRAGMENT_2,
    globalThis.BROADCAST_FRAGMENT_3
  ].forEach(f => {
    assert.ok(f.startMap);
    assert.ok(f.startPoint);
  });
});
