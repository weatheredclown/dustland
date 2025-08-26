import assert from 'node:assert';
import { test } from 'node:test';

test('event flags watch and clear via Dustland namespace', async () => {
  const flags = {};
  const handlers = {};
  globalThis.Dustland = { eventBus: { on: (evt, fn) => { handlers[evt] = fn; } } };
  globalThis.incFlag = (flag, amt = 1) => { flags[flag] = (flags[flag] || 0) + amt; };
  globalThis.flagValue = (flag) => flags[flag] || 0;
  globalThis.party = { flags: {} };
  await import('../core/event-flags.js');
  Dustland.eventFlags.watch('demo', 'demo_flag');
  handlers.demo();
  assert.strictEqual(flagValue('demo_flag'), 1);
  Dustland.eventFlags.clear('demo_flag');
  assert.strictEqual(flagValue('demo_flag'), 0);
});
