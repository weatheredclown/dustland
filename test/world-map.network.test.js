import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('open draws subway-style nodes for destinations', async () => {
  const document = makeDocument();
  document.createElementNS = (_, tag) => {
    const el = document.createElement(tag);
    el.setAttribute = (k, v) => { el[k] = v; };
    return el;
  };
  const context = { document, window: { document }, Dustland: { bunkers: [
    { id: 'home', active: true },
    { id: 'outpost', active: true }
  ], fastTravel: {
    fuelCost(){ return 4; }
  } } };
  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/ui/world-map.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);
  context.Dustland.worldMap.open('home');
  const overlay = document.body.children.find(c => c.id === 'worldMap');
  assert.ok(overlay);
  const circles = overlay.querySelectorAll('circle');
  assert.strictEqual(circles.length, 2);
  const [originCircle, destCircle] = circles;
  assert.strictEqual(originCircle.fill, '#0ff');
  assert.strictEqual(originCircle.r, 10);
  assert.strictEqual(originCircle.style.cursor, 'default');
  assert.strictEqual(destCircle.fill, '#fff');
  assert.strictEqual(destCircle.r, 8);
  assert.strictEqual(typeof destCircle.onclick, 'function');
});

