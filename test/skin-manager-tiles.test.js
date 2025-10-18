import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

class FakeImage {
  constructor(){
    this.complete = false;
    this.naturalWidth = 64;
    this.naturalHeight = 64;
    this.width = 64;
    this.height = 64;
    this._src = '';
  }
  set src(value){
    this._src = value;
    this.complete = true;
  }
  get src(){
    return this._src;
  }
  addEventListener(){
    // No-op for tests.
  }
}

function createSkinSandbox(){
  const sandbox = {
    console,
    EventBus: { emit(){}, on(){} },
    Map,
    Set,
    WeakMap,
    structuredClone,
    setTimeout,
    clearTimeout,
    Image: FakeImage,
    document: {
      readyState: 'complete',
      documentElement: { style: { setProperty(){}, removeProperty(){} } },
      body: { style: { setProperty(){}, removeProperty(){} } },
      querySelectorAll(){ return []; }
    },
    localStorage: {
      getItem(){ return null; },
      setItem(){},
      removeItem(){}
    }
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.Dustland = {};
  sandbox.TILE = {
    SAND: 0,
    ROCK: 1,
    WATER: 2,
    BRUSH: 3,
    ROAD: 4,
    RUIN: 5,
    WALL: 6,
    FLOOR: 7,
    DOOR: 8,
    BUILDING: 9
  };
  return sandbox;
}

function loadSkinManager(sandbox){
  const scriptPath = path.resolve(repoRoot, 'scripts/ui/skin-manager.js');
  const source = readFileSync(scriptPath, 'utf8');
  vm.runInNewContext(source, sandbox, { filename: 'skin-manager.js' });
  return sandbox.Dustland?.skin;
}

test('loadGeneratedSkin builds tile sprites from tile_* manifest slots', () => {
  const sandbox = createSkinSandbox();
  const skinApi = loadSkinManager(sandbox);
  assert.ok(skinApi, 'skin API should be available');

  const styleId = 'emerald-grid';
  const manifest = {
    tile_sand: 'sand.png',
    tile_rock: 'rock.png',
    panel_background: 'panel.png'
  };

  const result = skinApi.loadGeneratedSkin(styleId, {
    baseDir: 'ComfyUI/output',
    styleDir: styleId,
    manifest
  });

  assert.ok(result?.tiles, 'generated skin should include tiles');
  const tileMap = result.tiles.map || result.tiles.tiles;
  assert.ok(tileMap, 'tile map should exist');
  assert.equal(tileMap.sand, 'ComfyUI/output/emerald-grid/sand.png');
  assert.equal(tileMap.rock, 'ComfyUI/output/emerald-grid/rock.png');

  const sandSprite = skinApi.getTileSprite(sandbox.TILE.SAND, { x: 2, y: 3 });
  assert.ok(sandSprite, 'sand tile sprite should resolve');
  assert.equal(sandSprite.image._src, 'ComfyUI/output/emerald-grid/sand.png');

  const rockSprite = skinApi.getTileSprite(sandbox.TILE.ROCK, { x: 4, y: 1 });
  assert.ok(rockSprite, 'rock tile sprite should resolve');
  assert.equal(rockSprite.image._src, 'ComfyUI/output/emerald-grid/rock.png');
});

test('loadGeneratedSkin infers tile sprites when slots omit manifest paths', () => {
  const sandbox = createSkinSandbox();
  const skinApi = loadSkinManager(sandbox);
  assert.ok(skinApi, 'skin API should be available');

  const styleId = 'emerald-grid';

  const result = skinApi.loadGeneratedSkin(styleId, {
    baseDir: 'ComfyUI/output',
    styleDir: styleId,
    slots: {
      tile_sand: null,
      tile_rock: null
    }
  });

  assert.ok(result?.tiles, 'generated skin should include tiles');
  const tileMap = result.tiles.map || result.tiles.tiles;
  assert.ok(tileMap, 'tile map should exist');
  assert.equal(tileMap.sand, 'ComfyUI/output/emerald-grid/sand_tile.png');
  assert.equal(tileMap.rock, 'ComfyUI/output/emerald-grid/rock_tile.png');
});

test('loadGeneratedSkin derives tile atlas entries without slot manifests', () => {
  const sandbox = createSkinSandbox();
  const skinApi = loadSkinManager(sandbox);
  assert.ok(skinApi, 'skin API should be available');

  const styleId = 'emerald-grid';

  const result = skinApi.loadGeneratedSkin(styleId, {
    baseDir: 'ComfyUI/output',
    styleDir: styleId
  });

  assert.ok(result?.tiles, 'generated skin should include tiles');
  const tileMap = result.tiles.map || result.tiles.tiles;
  assert.ok(tileMap, 'tile map should exist');
  assert.equal(tileMap.sand, 'ComfyUI/output/emerald-grid/sand_tile.png');
  assert.equal(tileMap.rock, 'ComfyUI/output/emerald-grid/rock_tile.png');
});

