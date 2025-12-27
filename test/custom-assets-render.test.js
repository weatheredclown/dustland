import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert';
import { test } from 'node:test';

// Mock Classes
class AudioCtx {
  createOscillator() { return { connect() { }, start() { }, stop() { }, frequency: { value: 0 }, type: '' }; }
  createGain() { return { connect() { }, gain: { value: 0, exponentialRampToValueAtTime() { } } }; }
  get destination() { return {}; }
  resume() { }
  suspend() { }
  get currentTime() { return 0; }
}

class Audio {
  constructor() { this.addEventListener = () => { }; }
  cloneNode() { return new Audio(); }
  play() { return Promise.resolve(); }
  pause() { }
}

class Image {
  constructor() {
    this.src = '';
    this.width = 32;
    this.height = 32;
    this.complete = true;
  }
}

// Spy Context
const drawCalls = [];
const mockCtx = {
  fillRect() { },
  strokeRect() { },
  clearRect() { },
  beginPath() { },
  moveTo() { },
  lineTo() { },
  stroke() { },
  save() { },
  restore() { },
  translate() { },
  scale() { },
  fillText() { },
  setTransform() { },
  getImageData() { return { data: [] }; },
  createRadialGradient() { return { addColorStop() { } }; },
  globalAlpha: 1,
  font: '',
  fillStyle: '',
  strokeStyle: '',
  imageSmoothingEnabled: true,
  drawImage: (...args) => {
    drawCalls.push(args);
  }
};

class CanvasElem {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.style = {};
  }
  getContext(type) {
    return mockCtx;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 800, height: 600 };
  }
  getAttribute() { return null; }
  addEventListener() {}
}

const mockDoc = {
  getElementById: (id) => {
    if (id === 'game') return new CanvasElem();
    return {
      style: {},
      classList: {
        contains: () => false,
        add: () => { },
        remove: () => { }
      },
      appendChild: () => { },
      addEventListener: () => { },
      querySelector: () => ({ src: '', alt: '' }),
      value: ''
    };
  },
  createElement: (tag) => {
    if (tag === 'canvas') return new CanvasElem();
    return {
      style: { setProperty: () => {} },
      appendChild: () => { },
      classList: { add: () => { } }
    };
  },
  body: {
    appendChild: () => { },
    classList: { toggle: () => { } },
    style: { setProperty: () => {} }
  },
  documentElement: {
    style: { setProperty: () => {} }
  },
  querySelector: () => null
};

test('Custom Asset Rendering', async (t) => {
  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');

  const context = {
    window: {
      AudioContext: AudioCtx,
      webkitAudioContext: AudioCtx,
      Audio,
      Image,
      innerWidth: 1024,
      addEventListener: () => { },
      setTimeout: () => 0,
      clearTimeout: () => {},
      localStorage: { getItem: () => null, setItem: () => {} },
      requestAnimationFrame: (fn) => 0
    },
    document: mockDoc,
    navigator: { userAgent: 'Node' },
    console,
    URLSearchParams,
    performance: { now: () => Date.now() },
    Image,
    Audio,
    requestAnimationFrame: (fn) => 0,
    location: { search: '', hash: '' },
    openCreator: () => {},
    mapWH: () => ({ W: 20, H: 15 }),
    getViewSize: () => ({ w: 20, h: 15 }),
    getTile: () => 0, // Always return a tile ID
    mapIdForState: () => 'world',
    TILE: { FLOOR: 0, DOOR: 9 },
    colors: { 0: '#fff' },
    officeMaps: new Set(),
    itemDrops: [],
    portals: [],
    NPCS: [],
    party: [{ x: 5, y: 5 }],
    TS: 32,
    VIEW_W: 20,
    VIEW_H: 15,
    WORLD_W: 120,
    WORLD_H: 90,
    doorPulseUntil: 0
  };
  context.globalThis = context;
  context.self = context;

  context.EventBus = {
    on: () => {},
    emit: () => {},
    off: () => {}
  };
  context.Dustland = { eventBus: context.EventBus };

  vm.createContext(context);
  vm.runInContext(code, context);

  // Setup Module Data with Custom Assets
  const customAssetId = 'test-asset-1';
  const customAssetUrl = 'data:image/png;base64,fake';

  context.engineGlobals.DUSTLAND_MODULE = {
    customAssets: {
      [customAssetId]: {
        url: customAssetUrl,
        width: 32,
        height: 32
      }
    },
    tileOverrides: {
      'world': {
        '0,0': { assetId: customAssetId, opacity: 0.5 } // x=0, y=0
      }
    }
  };

  // Mock State
  context.state = {
    map: 'world',
    party: { x: 0, y: 0 }, // Player at 0,0
    entities: []
  };
  context.party = [{ x: 5, y: 5 }];
  context.camX = 0;
  context.camY = 0;

  // Ensure we can see the tile at 5,5
  // Default view size is often around 20x15 tiles.
  // Player at 5,5 is well within view.

  // Clear previous calls (from init)
  drawCalls.length = 0;

  context.camX = 0;
  context.camY = 0;

  // Run Render
  // The engine exports 'render' on window/globalThis, or we can access it if it was assigned.
  // In dustland-engine.ts: window.renderOrderSystem = { order: renderOrder, render };

  const render = context.window.renderOrderSystem?.render;
  assert.ok(render, 'Render function should be exposed');

  render(context.state);

  // Verify
  // We expect a drawImage call for our custom asset
  // The logic:
  // 1. Iterates tiles.
  // 2. Checks tileOverrides['world'][key]
  // 3. Calls ctx.drawImage(img, ...)

  const assetCalls = drawCalls.filter(args => {
    const img = args[0];
    return img && img.src === customAssetUrl;
  });

  if (assetCalls.length !== 1) {
    console.log('Draw calls:', drawCalls.map(c => c[0].src));
  }

  assert.strictEqual(assetCalls.length, 1, 'Should have drawn the custom asset exactly once');

  // Verify opacity was handled?
  // Our mockCtx captures drawImage args, but not property assignments like globalAlpha.
  // To test opacity, we'd need to spy on the setter for globalAlpha.
  // But verifying the call happened is the primary goal here.
});
