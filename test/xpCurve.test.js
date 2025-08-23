import assert from 'node:assert';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import '../core/party.js';

test('xpToNext pulls values from xpCurve', async () => {
  await delay(10);
  assert.strictEqual(globalThis.xpCurve[1], 100);
  assert.strictEqual(globalThis.xpToNext(1), 100);
  assert.strictEqual(globalThis.xpToNext(2), 100);
});
