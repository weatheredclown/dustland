import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('EventBus exposes Dustland namespace', async () => {
  const code = await fs.readFile(new URL('../event-bus.js', import.meta.url), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.ok(context.Dustland?.eventBus);
  assert.strictEqual(context.EventBus, context.Dustland.eventBus);
  assert.strictEqual(typeof context.Dustland.EventBus, 'undefined');
  assert.strictEqual(typeof context.on, 'undefined');
});
