import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('showMap handles interiors missing grid data', async () => {
  const document = makeDocument();
  const mapEl = document.getElementById('map');
  mapEl.width = 16;
  mapEl.height = 16;
  const intEl = document.getElementById('intCanvas');
  intEl.width = 16;
  intEl.height = 16;

  const context = {
    document,
    canvas: mapEl,
    ctx: mapEl.getContext('2d'),
    intCanvas: intEl,
    intCtx: intEl.getContext('2d'),
    moduleData: { interiors: [{ id: 'room1', w: 2, h: 2 }], npcs: [], items: [], portals: [], events: [], zones: [] },
    mapSelect: document.createElement('select'),
    editInteriorIdx: -1,
    currentMap: 'world',
    worldZoom: 1,
    panX: 0,
    panY: 0,
    world: [[0]],
    WORLD_W: 1,
    WORLD_H: 1,
    baseTileW: 16,
    baseTileH: 16,
    akColors: [],
    TILE: { WALL: 1, DOOR: 2, FLOOR: 0 },
    hoverTile: null,
    hoverTarget: null,
    selectedObj: null,
    bldgGrid: [],
    placingType: null,
    placingPos: null,
    renderProblems() {},
    showEditorTab: () => {},
    window: {},
  };
  context.editInterior = i => { context.editInteriorIdx = i; context.drawInterior(); };

  vm.createContext(context);
  const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
  const start = code.indexOf('const mapSelect');
  const end = code.indexOf('function interiorCanvasPos');
  vm.runInContext(code.slice(start, end), context);

  assert.doesNotThrow(() => context.showMap('room1'));
});
