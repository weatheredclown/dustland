import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const ctx = { clearRect(){}, fillRect(){}, fillStyle: '', count:0 };
  let inner = '';
  const classSet = new Set();
  let classNameValue = '';
  function syncFromString(value){
    classSet.clear();
    value.split(/\s+/).filter(Boolean).forEach(cls => classSet.add(cls));
  }
  function syncToString(){
    classNameValue = Array.from(classSet).join(' ');
  }
  const el = {
    id: '',
    style: {},
    children: [],
    appendChild(child){
      this.children.push(child);
      child.parentElement = this;
      if(child.onload) child.onload();
    },
    remove(){},
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    textContent: '',
    get className(){ return classNameValue; },
    set className(value){ classNameValue = value || ''; syncFromString(classNameValue); },
    classList: {
      add(cls){ classSet.add(cls); syncToString(); },
      remove(cls){ classSet.delete(cls); syncToString(); },
      toggle(cls, force){
        const shouldAdd = force ?? !classSet.has(cls);
        if (shouldAdd) classSet.add(cls); else classSet.delete(cls);
        syncToString();
        return shouldAdd;
      },
      contains(cls){ return classSet.has(cls); }
    },
    ctx,
    getContext: () => ctx,
    set innerHTML(html){ inner = html; this.children.length = 0; },
    get innerHTML(){ return inner; }
  };
  return el;
}

global.requestAnimationFrame = () => {};
Object.assign(global, {
  window: global,
  innerWidth: 800,
  innerHeight: 600,
  addEventListener(){},
  localStorage: { getItem: () => null, removeItem: () => {} },
  location: { href: '' }
});

global.UI = { remove: () => {} };

const bodyEl = stubEl();
const headEl = stubEl();

global.document = {
  body: bodyEl,
  head: headEl,
  createElement: () => stubEl(),
  getElementById: () => null
};

let openCalls = 0;
let resetCalls = 0;

global.openCreator = () => { openCalls++; };
global.showStart = () => {};
global.resetAll = () => { resetCalls++; };

const code = await fs.readFile(new URL('../scripts/module-picker.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: '../scripts/module-picker.js' });

function getModule(){ return { id:'fake', name:'Fake', file:'fake.js' }; }

await test('resetAll reloads current module', () => {
  loadModule(getModule());
  assert.strictEqual(openCalls, 1);
  resetAll();
  assert.strictEqual(resetCalls, 1);
  assert.strictEqual(openCalls, 2);
});

