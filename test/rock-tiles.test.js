import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

test('rock tiles are walkable and hall uses wall tiles', () => {
  function stubEl() {
    return {
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      appendChild() {},
      prepend() {},
      remove() {},
      querySelector() { return stubEl(); },
      querySelectorAll() { return []; },
      getContext() {
        return { clearRect() {}, drawImage() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, save() {}, restore() {}, translate() {}, font: '', fillText() {}, globalAlpha: 1 };
      },
      addEventListener() {},
      dataset: {},
      parentElement: { appendChild() {}, querySelectorAll() { return []; } }
    };
  }

  const context = {
    document: {
      body: { appendChild() {}, classList: { add() {}, remove() {}, toggle() {} } },
      getElementById() { return stubEl(); },
      createElement() { return stubEl(); },
      querySelector() { return stubEl(); }
    },
    EventBus: { on() {}, emit() {} },
    window: {},
    location: { hash: '', search: '' },
    localStorage: { getItem() {}, setItem() {}, removeItem() {} },
    requestAnimationFrame() {},
    global: null
  };
  context.globalThis = context;
  context.global = context;
  vm.createContext(context);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'dustland-core.js'), 'utf8');
  vm.runInContext(src, context);
  assert.strictEqual(context.walkable[context.TILE.ROCK], true);

  const modSrc = fs.readFileSync(path.join(__dirname, '..', 'modules', 'dustland.module.js'), 'utf8');
  const start = modSrc.indexOf('const DATA = `') + 'const DATA = `'.length;
  const end = modSrc.indexOf('`;', start);
  const data = JSON.parse(modSrc.slice(start, end));
  const hall = data.interiors.find(m => m.id === 'hall');
  const joined = hall.grid.join('');
  assert.ok(!joined.includes('🪨'));
  assert.ok(joined.includes('🧱'));
});
