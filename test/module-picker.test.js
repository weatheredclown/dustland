import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const el = {
    id: '',
    style: {},
    children: [],
    textContent: '',
    className: '',
    appendChild(child){ this.children.push(child); child.parentElement = this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getContext: () => ({ clearRect(){}, fillRect(){}, fillStyle:'', })
  };
  return el;
}

global.requestAnimationFrame = () => {};
Object.assign(global, {
  window: global,
  innerWidth: 800,
  innerHeight: 600,
  addEventListener(){},
  localStorage: { getItem: () => null }
});

const bodyEl = stubEl();
const headEl = stubEl();

global.document = {
  body: bodyEl,
  head: headEl,
  createElement: () => stubEl(),
  getElementById: () => null
};

global.openCreator = () => {};
global.showStart = () => {};

const code = await fs.readFile(new URL('../module-picker.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: '../module-picker.js' });

test('module picker shows title and dust background', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  assert.ok(overlay);
  const title = overlay.children.find(c => c.id === 'gameTitle');
  assert.ok(title);
  assert.strictEqual(title.textContent, 'Dustland CRT');
  const canvas = overlay.children.find(c => c.id === 'dustParticles');
  assert.ok(canvas);
});
