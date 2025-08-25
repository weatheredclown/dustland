import assert from 'node:assert';
import { test } from 'node:test';

test('watchEventFlag increments and clearFlag resets', async () => {
  const flags = {};
  const handlers = {};
  globalThis.EventBus = { on: (evt, fn) => { handlers[evt] = fn; } };
  globalThis.incFlag = (flag, amt = 1) => { flags[flag] = (flags[flag] || 0) + amt; };
  globalThis.flagValue = (flag) => flags[flag] || 0;
  globalThis.party = { flags: {} };
  await import('../core/event-flags.js');
  watchEventFlag('demo', 'demo_flag');
  handlers.demo();
  assert.strictEqual(flagValue('demo_flag'), 1);
  clearFlag('demo_flag');
  assert.strictEqual(flagValue('demo_flag'), 0);
});
