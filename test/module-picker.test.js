import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const ctx = { clearRect(){}, fillRect(){ ctx.count++; }, fillStyle:'', count:0 };
  const el = {
    id: '',
    style: {},
    children: [],
    textContent: '',
    className: '',
    appendChild(child){ this.children.push(child); child.parentElement = this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    ctx,
    getContext: () => ctx
  };
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
