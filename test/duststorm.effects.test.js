import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const setup = async () => {
  const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.requestAnimationFrame = () => 0;
  window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    fillRect() {},
  });
  global.soundSources = [];
  global.state = { map: 'dust_storm' };
  await import(new URL('../core/effects.js', import.meta.url));
  return dom;
};

test('dustStorm and addSoundSource effects', async () => {
  const dom = await setup();
  const { Effects } = globalThis;

  Effects.apply([{ effect: 'dustStorm', active: true }]);
  assert.ok(document.getElementById('dustStorm'));

  Effects.apply([{ effect: 'addSoundSource', id: 'chime1', x: 2, y: 3 }]);
  assert.deepStrictEqual(global.soundSources, [{ id: 'chime1', x: 2, y: 3, map: 'dust_storm' }]);

  Effects.apply([{ effect: 'dustStorm', active: false }]);
  assert.strictEqual(document.getElementById('dustStorm'), null);

  dom.window.close();
});
