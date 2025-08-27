import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const ctx = { clearRect(){}, fillRect(){ ctx.count++; }, fillStyle:'', count:0 };
  let inner = '';
  const el = {
    id: '',
    style: {},
    children: [],
    textContent: '',
    className: '',
    listeners: {},
    appendChild(child){ this.children.push(child); child.parentElement = this; },
    querySelector(sel){
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        return find(this, id) || stubEl();
      }
      return stubEl();
    },
    querySelectorAll(){ return []; },
    addEventListener(type, fn){ this.listeners[type] = fn; },
    dispatchEvent(evt){ const fn = this.listeners[evt.type]; if (fn) fn(evt); },
    ctx,
    getContext: () => ctx,
    set innerHTML(html){
      inner = html;
      if (html.includes('id="moduleButtons"')) {
        const main = stubEl();
        main.id = 'moduleButtons';
        this.children.push(main);
      }
    },
    get innerHTML(){ return inner; }
  };
  function find(node, id){
    if (node.id === id) return node;
    for (const child of node.children){
      const res = find(child, id);
      if (res) return res;
    }
    return null;
  }
  return el;
}

global.requestAnimationFrame = () => {};
Object.assign(global, {
  window: global,
  innerWidth: 800,
  innerHeight: 600,
  addEventListener(){},
  localStorage: { getItem: () => null },
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

global.openCreator = () => {};
global.showStart = () => {};

const code = await fs.readFile(new URL('../module-picker.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: '../module-picker.js' });

test('module picker shows title and dust background', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  assert.ok(overlay);
  const title = overlay.querySelector('#gameTitle');
  assert.ok(title);
  assert.strictEqual(title.textContent, 'Dustland CRT');
  const canvas = overlay.children.find(c => c.id === 'dustParticles');
  assert.ok(canvas);
  assert.ok(canvas.ctx.count > 0);
});

test('adventure kit glyph navigates to editor', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  const glyph = overlay.children.find(c => c.id === 'ackGlyph');
  assert.ok(glyph);
  glyph.onclick();
  assert.strictEqual(global.location.href, 'adventure-kit.html');
});

test('particles respawn at edges after aging', () => {
  const canvas = stubEl();
  const dust = startDust(canvas);
  dust.particles.forEach(p => p.life = 1);
  dust.update();
  const allAtEdges = dust.particles.every(p => p.x === 0 || p.x === canvas.width || p.y === 0 || p.y === canvas.height);
  assert.ok(allAtEdges);
  const moving = dust.particles.some(p => p.vx !== 0 || p.vy !== 0);
  assert.ok(moving);
});

test('arrow keys cycle module selection', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  const buttons = overlay.querySelector('#moduleButtons').children;
  assert.ok(buttons[0].className.includes('selected'));
  overlay.dispatchEvent({ type: 'keydown', key: 'ArrowDown', preventDefault(){} });
  assert.ok(buttons[1].className.includes('selected'));
});

test('enter key loads selected module', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  overlay.dispatchEvent({ type: 'keydown', key: 'ArrowUp', preventDefault(){} });
  for (let i = 0; i < 6; i++) {
    overlay.dispatchEvent({ type: 'keydown', key: 'ArrowDown', preventDefault(){} });
  }
  overlay.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault(){} });
  assert.ok(global.location.href.includes('golden.module.json'));
});
