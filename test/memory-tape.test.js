import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('memory tape records and replays', async () => {
  const code = await fs.readFile(new URL('../scripts/memory-tape.js', import.meta.url), 'utf8');
  let heard;
  const context = {
    registerItem: it => { context.item = it; return it; },
    NPCS: [{ id: 'tape_sage', map: 'hall', x: 0, y: 0, onMemoryTape: msg => { heard = msg; } }],
    party: { map: 'hall', x: 0, y: 0 },
    log: () => {},
    toast: () => {}
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  context.log('first record');
  context.item.use.onUse({ log: context.log });
  context.log('second record');
  context.item.use.onUse({ log: context.log });
  assert.equal(context.item.recording, 'first record');
  assert.equal(heard, 'first record');
});
