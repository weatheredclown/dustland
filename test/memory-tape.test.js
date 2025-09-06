import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

test('memory tape records and plays back', () => {
  const context = {
    registerItem: (obj) => obj,
    NPCS: [{ map: 'world', x: 0, y: 0, onMemoryTape(msg){ context.played = msg; } }],
    party: { map: 'world', x: 0, y: 0 },
    logs: [],
    log(m){ context.logs.push(m); }
  };
  const code = fs.readFileSync(new URL('../scripts/memory-tape.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, context);
  context.log('hello');
  context.memoryTape.use.onUse({ log: context.log });
  context.log('bye');
  context.memoryTape.use.onUse({ log: context.log });
  assert.ok(context.logs.some(m => /recorded/.test(m)));
  assert.ok(context.logs.some(m => /plays/.test(m)));
  assert.strictEqual(context.played, 'hello');
});
