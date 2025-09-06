import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('beacon crafting tutorial triggers alert', async () => {
  const context = {
    EventBus: {
      handlers:{},
      on(evt, fn){ this.handlers[evt]=fn; },
      emit(evt, payload){ this.handlers[evt]?.(payload); }
    },
    localStorage: { setItem(){}, getItem(){} }
  };
  context.alert = (msg) => { context.msg = msg; };
  vm.createContext(context);
  const src = await fs.readFile(new URL('../scripts/beacon-tutorial.js', import.meta.url), 'utf8');
  vm.runInContext(src, context);
  context.EventBus.emit('craft:signal-beacon');
  assert.ok(context.msg && context.msg.toLowerCase().includes('signal beacon'), 'tutorial alert fired');
});
