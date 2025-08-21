import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    style:{},
    classList:{ _set:new Set(), toggle(c){this._set.has(c)?this._set.delete(c):this._set.add(c);}, add(c){this._set.add(c);}, remove(c){this._set.delete(c);}, contains(c){return this._set.has(c);}},
    textContent:'',
    onclick:null,
    value:'',
    _innerHTML:'',
    children:[],
    width:0,
    height:0,
    appendChild(child){ this.children.push(child); child.parentElement=this; },
    prepend(child){ this.children.unshift(child); child.parentElement=this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getContext: () => ({
      clearRect(){}, drawImage(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, strokeRect(){},
      save(){}, restore(){}, translate(){}, font:'', fillText(){}, globalAlpha:1
    }),
    addEventListener(){},
    removeEventListener(){},
    parentElement:{ appendChild(){}, querySelectorAll(){ return []; } },
    setAttribute(){},
    click(){},
  };
  Object.defineProperty(el,'innerHTML',{ get(){return this._innerHTML;}, set(v){ this._innerHTML=v; this.children=[]; }});
  return el;
}

global.requestAnimationFrame = () => {};
global.alert = () => {};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = global;
window.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
const bodyEl = stubEl();
global.document = {
  body: bodyEl,
  getElementById: () => stubEl(),
  createElement: () => stubEl(),
  querySelector: () => stubEl(),
  querySelectorAll: () => []
};

const files = [
  '../event-bus.js',
  '../core/movement.js',
  '../dustland-core.js',
  '../adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

const { applyLoadedModule, TILE, setTile, placeHut, genWorld } = globalThis;

test('applyLoadedModule clears previous building tiles', () => {
  genWorld(123);
  globalThis.buildings.forEach(b => {
    for (let y=0; y<b.h; y++) {
      for (let x=0; x<b.w; x++) {
        setTile('world', b.x + x, b.y + y, b.under[y][x]);
      }
    }
  });
  globalThis.buildings.length = 0;
  placeHut(1,1);
  assert.strictEqual(world[1][1], TILE.BUILDING);
  applyLoadedModule({ seed: 123, buildings: [] });
  assert.notStrictEqual(world[1][1], TILE.BUILDING);
  assert.strictEqual(globalThis.buildings.length, 0);
});
