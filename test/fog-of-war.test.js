import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

async function loadCoreFogSnippet(){
  const code = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');
  const start = code.indexOf('const FOG_RADIUS');
  const end = code.indexOf('const state =', start);
  assert.ok(start >= 0 && end > start, 'fog snippet boundaries found');
  return code.slice(start, end);
}

function extractFunction(code, name){
  const start = code.indexOf(`function ${name}`);
  assert.ok(start >= 0, `found ${name}`);
  const braceStart = code.indexOf('{', start);
  assert.ok(braceStart >= 0, `found ${name} body`);
  let depth = 0;
  let end = braceStart;
  for(let i=braceStart; i<code.length; i++){
    const ch = code[i];
    if(ch === '{') depth++;
    else if(ch === '}'){
      depth--;
      if(depth === 0){
        end = i + 1;
        break;
      }
    }
  }
  assert.strictEqual(depth, 0, `${name} braces balanced`);
  return code.slice(start, end);
}

async function loadEngineFogSnippet(){
  const code = await fs.readFile(new URL('../scripts/dustland-engine.js', import.meta.url), 'utf8');
  const constantMatch = code.match(/const FOG_UNSEEN_ALPHA\s*=\s*[^;]+;/);
  assert.ok(constantMatch?.[0], 'found FOG_UNSEEN_ALPHA constant');
  const shouldRenderFog = extractFunction(code, 'shouldRenderFog');
  const renderFog = extractFunction(code, 'renderFog');
  return `${constantMatch[0]}\n${shouldRenderFog}\n${renderFog}`;
}

test('revealFog stores gradient visibility and preserves the brightest value', async () => {
  const snippet = await loadCoreFogSnippet();
  const context = {
    globalThis: {},
    state: { fog: {} },
    mapWH: () => ({ W: 20, H: 20 })
  };
  vm.runInNewContext(snippet, context);

  context.revealFog('world', 5, 5, 3);
  const fog = context.state.fog.world;
  assert.ok(fog, 'fog state created for map');
  assert.strictEqual(typeof fog['5,5'], 'number');
  assert.strictEqual(fog['5,5'], 1);
  assert.ok(fog['8,5'] > 0 && fog['8,5'] < 1, 'edge tiles record partial visibility');
  assert.strictEqual(fog['9,5'], undefined, 'tiles outside radius stay unseen');

  const previous = fog['7,5'];
  context.revealFog('world', 9, 5, 2);
  assert.strictEqual(fog['7,5'], previous, 'we keep the brightest recorded visibility');
});

test('renderFog blends stored visibility with unseen darkness', async () => {
  const snippet = await loadEngineFogSnippet();
  const context = {
    globalThis: {},
    camX: 0,
    camY: 0,
    TS: 1,
    state: { fog: { world: { '0,0': 1, '1,0': 0.5 } } },
    party: { x: 10, y: 10 },
    mapSupportsFog: () => true,
    mapWH: () => ({ W: 10, H: 10 })
  };
  vm.runInNewContext(snippet, context);
  context.globalThis.FOG_RADIUS = 2;

  const ctxStub = {
    fills: [],
    globalAlpha: 1,
    fillStyle: '',
    fillRect(x, y, w, h) {
      this.fills.push({ x, y, w, h, alpha: this.globalAlpha });
    }
  };

  context.renderFog(ctxStub, 'world', 0, 0, 3, 1);

  const gradientTile = ctxStub.fills.find(f => f.x === 1);
  assert.ok(gradientTile, 'partially revealed tile rendered');
  const fogUnseenAlpha = vm.runInNewContext('FOG_UNSEEN_ALPHA', context);
  const expectedGradientAlpha = (1 - 0.5) * fogUnseenAlpha;
  assert.ok(Math.abs(gradientTile.alpha - expectedGradientAlpha) < 1e-9);

  const unseenTile = ctxStub.fills.find(f => f.x === 2);
  assert.ok(unseenTile, 'unseen tile rendered');
  assert.strictEqual(unseenTile.alpha, fogUnseenAlpha);
  assert.ok(!ctxStub.fills.some(f => f.x === 0), 'fully revealed tile skips overlay');
  assert.strictEqual(ctxStub.globalAlpha, 1, 'alpha reset after rendering');
});
