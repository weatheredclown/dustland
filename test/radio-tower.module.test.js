import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

test('radio tower module registers interior map', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'radio-tower.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const context = {
    interiors: {},
    openRadioPuzzle: () => {},
    setPartyPos: () => {},
    setMap: () => {},
    log: () => {}
  };
  context.applyModule = mod => {
    (mod.interiors || []).forEach(i => { context.interiors[i.id] = i; });
  };
  context.globalThis = context;
  vm.runInNewContext(src, context);
  context.startGame();
  assert.ok(context.interiors.tower, 'tower interior registered');
  assert.strictEqual(context.RADIO_TOWER.maps, undefined);
});
