import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: { _set: new Set(), toggle(c) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); }, add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); }, contains(c) { return this._set.has(c); } },
    textContent: '',
    onclick: null,
    value: '',
    dataset: {},
    _innerHTML: '',
    children: [],
    width: 0,
    height: 0,
    appendChild(child) { this.children.push(child); child.parentElement = this; },
    prepend(child) { this.children.unshift(child); child.parentElement = this; },
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ left: 0, top: 0, bottom: 0 }),
    getContext: () => ({
      clearRect() {}, drawImage() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, strokeRect() {},
      save() {}, restore() {}, translate() {}, font: '', fillText() {}, globalAlpha: 1, imageSmoothingEnabled: true
    }),
    toDataURL: () => 'data:image/jpeg;base64,captured',
    removeAttribute(name) { delete el[name]; },
    setAttribute() {},
    addEventListener(type, fn) { this._listeners = this._listeners || {}; (this._listeners[type] = this._listeners[type] || []).push(fn); },
    removeEventListener() {},
    click() { if (this.onclick) this.onclick(); if (this._listeners?.click) this._listeners.click.forEach(fn => fn()); },
    focus() {},
  };
  Object.defineProperty(el, 'innerHTML', { get() { return this._innerHTML; }, set(v) { this._innerHTML = v; this.children = []; } });
  return el;
}

global.requestAnimationFrame = () => {};
global.alert = () => {};
global.confirm = () => true;
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.window = global;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

const canvasEl = stubEl('canvas');
canvasEl.width = 120;
canvasEl.height = 90;
const intCanvasEl = stubEl('canvas');
intCanvasEl.width = 80;
intCanvasEl.height = 80;
const worldButtons = Array.from({ length: 3 }, (_, i) => { const b = stubEl(); b.dataset = { tile: String(i) }; return b; });
const worldPalette = stubEl();
worldPalette.querySelectorAll = () => worldButtons;
const elements = { map: canvasEl, intCanvas: intCanvasEl, worldPalette, paletteLabel: stubEl(), moduleName: stubEl() };
global.document = {
  body: stubEl('body'),
  getElementById: id => elements[id] || (elements[id] = stubEl()),
  createElement: tag => stubEl(tag),
  querySelector: () => stubEl(),
  querySelectorAll: () => [],
  activeElement: null,
  addEventListener() {},
  removeEventListener() {},
};

global.NanoPalette = { init: () => {}, generate: async () => Array(16).fill('x'.repeat(16)), enabled: true };
globalThis.party = { x: 0, y: 0 };
vm.runInThisContext('var party = globalThis.party;');

const files = [
  'scripts/event-bus.js',
  'scripts/core/movement.js',
  'scripts/dustland-core.js',
  'scripts/core/dialog.js',
  'scripts/adventure-kit.js'
];
for (const f of files) {
  const code = await fs.readFile(new URL('../' + f, import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: f });
}

test('capture button stores a thumbnail and shows the preview', () => {
  elements.captureThumb.click();
  assert.strictEqual(globalThis.moduleData.thumbnail, 'data:image/jpeg;base64,captured');
  assert.strictEqual(elements.moduleThumb.src, 'data:image/jpeg;base64,captured');
  assert.strictEqual(elements.moduleThumb.style.display, 'inline-block');
  assert.strictEqual(elements.moduleThumbEmpty.style.display, 'none');
});

test('thumbnail exports with the module payload', () => {
  const { data } = globalThis.exportModulePayload();
  assert.strictEqual(data.thumbnail, 'data:image/jpeg;base64,captured');
});

test('thumbnail round-trips through applyLoadedModule', () => {
  globalThis.applyLoadedModule({ seed: 1, thumbnail: 'data:image/jpeg;base64,fromcloud' });
  assert.strictEqual(globalThis.moduleData.thumbnail, 'data:image/jpeg;base64,fromcloud');
  assert.strictEqual(elements.moduleThumb.src, 'data:image/jpeg;base64,fromcloud');
});

test('modules without a thumbnail clear the preview and skip the export key', () => {
  globalThis.applyLoadedModule({ seed: 2 });
  assert.strictEqual(globalThis.moduleData.thumbnail, '');
  assert.strictEqual(elements.moduleThumb.style.display, 'none');
  assert.strictEqual(elements.moduleThumbEmpty.style.display, 'inline');
  const { data } = globalThis.exportModulePayload();
  assert.strictEqual('thumbnail' in data, false);
});
