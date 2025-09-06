import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.join('scripts','supporting','effect-pack-inspector.js');
const src = fs.readFileSync(file, 'utf8');

test('effectPackInspector fires loaded packs', () => {
  const context = {
    Dustland: { effects: { apply(list){ context.applied = list; } } },
    EventBus: { emit() {} },
    log: () => {}
  };
  vm.runInNewContext(src, context);
  const json = JSON.stringify({ test:[{ effect:'log', msg:'hi' }] });
  context.Dustland.effectPackInspector.load(json);
  context.Dustland.effectPackInspector.fire('test');
  assert.equal(context.applied[0].effect, 'log');
});
