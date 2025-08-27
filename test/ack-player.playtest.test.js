import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

test('engine skips start when ack-player param present', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = `<!DOCTYPE html><body>
    <div id="log"></div>
    <div id="hp"></div>
    <div id="ap"></div>
    <div id="scrap"></div>
    <canvas id="game"></canvas>
  </body>`;
  const dom = new JSDOM(html, { url: 'http://localhost/dustland.html?ack-player=1' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.location = window.location;
  window.requestAnimationFrame = () => {};
  global.requestAnimationFrame = window.requestAnimationFrame;
  window.NanoDialog = { init: () => {} };
  global.NanoDialog = window.NanoDialog;
  window.AudioContext = function() {};
  window.webkitAudioContext = window.AudioContext;
  window.Audio = function(){ return { cloneNode: () => ({ play: () => {} }) }; };
  global.Audio = window.Audio;
  global.EventBus = { on: () => {}, emit: () => {} };
  global.TS = 16;
  global.camX = 0;
  global.camY = 0;
  global.interactAt = () => {};
  window.HTMLCanvasElement.prototype.getContext = () => ({
    drawImage: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {}
  });
  const store = { dustland_crt: '{}' };
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (k) => store[k],
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; }
    }
  });
  global.localStorage = window.localStorage;
  let startShown = false;
  let creatorOpened = false;
  global.showStart = () => { startShown = true; };
  global.openCreator = () => { creatorOpened = true; };
  global.bootMap = () => {};
  global.draw = () => {};
  global.runTests = () => {};
  const enginePath = path.join(__dirname, '..', 'scripts', 'dustland-engine.js');
  window.eval(fs.readFileSync(enginePath, 'utf8'));
  assert.ok(!startShown && !creatorOpened, 'engine should not boot when ack-player param present');
});
