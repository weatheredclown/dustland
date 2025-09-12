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

const hidden = [];
const shown = [];
global.UI = {
  remove: () => {},
  hide: id => hidden.push(id),
  show: id => shown.push(id)
};

const bodyEl = stubEl();
const headEl = stubEl();

global.document = {
  body: bodyEl,
  head: headEl,
  createElement: () => stubEl(),
  getElementById: id => id === 'loadBtn' ? stubEl() : null
};


global.openCreator = () => {};
global.showStart = () => {};

const code = await fs.readFile(new URL('../scripts/module-picker.js', import.meta.url), 'utf8');
vm.runInThisContext(code, { filename: '../scripts/module-picker.js' });

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

test('multiplayer glyph navigates to multiplayer', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  const glyph = overlay.children.find(c => c.id === 'mpGlyph');
  assert.ok(glyph);
  glyph.onclick();
  assert.strictEqual(global.location.href, 'multiplayer.html');
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

test('broadcast story points to first fragment', () => {
  const broadcast = MODULES.find(m => m.id === 'broadcast');
  assert.ok(broadcast);
  assert.strictEqual(broadcast.file, 'modules/broadcast-fragment-1.module.js');
});

test('pit module points to pit-bas', () => {
  const pit = MODULES.find(m => m.id === 'pit');
  assert.ok(pit);
  assert.strictEqual(pit.file, 'modules/pit-bas.module.js');
});

test('other module points to other-bas', () => {
  const other = MODULES.find(m => m.id === 'other');
  assert.ok(other);
  assert.strictEqual(other.file, 'modules/other-bas.module.js');
});

test('two-worlds module points to entry script', () => {
  const tw = MODULES.find(m => m.id === 'two-worlds');
  assert.ok(tw);
  assert.strictEqual(tw.file, 'modules/two-worlds.module.js');
});

test('true-dust module points to entry script', () => {
  const td = MODULES.find(m => m.id === 'true-dust');
  assert.ok(td);
  assert.strictEqual(td.file, 'modules/true-dust.module.js');
});

test('enter key loads selected module', () => {
  loadModule(MODULES[MODULES.length - 1]);
  assert.ok(global.location.href.includes('golden.module.json'));
});

test('loadModule preserves existing save data', () => {
  const ls = {
    data: { 'dustland_crt': 'foo' },
    getItem(key){ return this.data[key] || null; },
    setItem(key, val){ this.data[key] = val; },
    removeItem(key){ delete this.data[key]; }
  };
  global.localStorage = ls;
  loadModule(MODULES[0]);
  const scriptEl = bodyEl.children.find(c => c.id === 'activeModuleScript');
  assert.ok(scriptEl);
  scriptEl.onload();
  assert.strictEqual(ls.getItem('dustland_crt'), 'foo');
  assert.ok(shown.includes('loadBtn'));
});

test('load button hidden until module loads', () => {
  assert.ok(hidden.includes('loadBtn'));
});
