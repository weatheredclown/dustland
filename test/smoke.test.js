import assert from 'node:assert';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const htmlFiles = ['dustland.html', 'ack-player.html', 'adventure-kit.html'];
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function loadNoError(file){
  const dom = await JSDOM.fromFile(path.join(rootDir, file), {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window){
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      window.alert = () => {};
      window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} });
      window.AudioContext = class {
        createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 }, type:'' }; }
        createGain(){ return { connect(){}, gain:{ value:0, exponentialRampToValueAtTime(){}} }; }
        get destination(){ return {}; }
        get currentTime(){ return 0; }
      };
      const dummyCtx = new Proxy({}, { get: () => () => {}, set: () => true });
      window.HTMLCanvasElement.prototype.getContext = () => dummyCtx;
      const store = new Map();
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: k => (store.has(k) ? store.get(k) : null),
          setItem: (k, v) => { store.set(k, String(v)); },
          removeItem: k => { store.delete(k); },
          clear: () => { store.clear(); }
        },
        configurable: true
      });
      const realGetById = window.document.getElementById.bind(window.document);
      window.document.getElementById = id => {
        const el = realGetById(id);
        if (el) return el;
        if (id === 'game') {
          const canvas = window.document.createElement('canvas');
          canvas.id = 'game';
          canvas.width = 640;
          canvas.height = 480;
          window.document.body.appendChild(canvas);
          return canvas;
        }
        const div = window.document.createElement('div');
        div.id = id;
        window.document.body.appendChild(div);
        return div;
      };
    }
  });
  return new Promise((resolve, reject) => {
    const cleanup = () => dom.window.close();
    dom.window.addEventListener('error', e => { cleanup(); reject(e.error || e.message); });
    dom.window.addEventListener('unhandledrejection', e => { cleanup(); reject(e.reason); });
    dom.window.addEventListener('load', () => { cleanup(); resolve(); });
  });
}

for (const f of htmlFiles){
  test(`${f} loads without runtime errors`, async () => {
    await assert.doesNotReject(() => loadNoError(f));
  });
}
