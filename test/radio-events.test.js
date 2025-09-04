import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('startRadioEvents emits radio:event', async () => {
  const events = [];
  const context = {
    Dustland: { eventBus: { emit: (evt, payload) => events.push({ evt, payload }) } },
    setInterval: fn => { fn(); return 0; },
    clearInterval: () => {}
  };
  context.globalThis = context;
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/radio-events.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);
  context.Dustland.startRadioEvents(0);
  assert.strictEqual(events[0].evt, 'radio:event');
  assert.ok(events[0].payload.msg);
});
