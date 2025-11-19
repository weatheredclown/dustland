import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function stubEl(){
  const ctx = { clearRect(){}, fillRect(){ ctx.count++; }, fillStyle:'', count:0 };
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
        const tabs = stubEl();
        tabs.id = 'moduleTabs';
        const list = stubEl();
        list.id = 'moduleList';
        const status = stubEl();
        status.id = 'moduleStatus';
        main.appendChild(tabs);
        main.appendChild(list);
        main.appendChild(status);
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

function createBridgeState(){
  return { listeners: new Map(), seq: 1 };
}

function cloneBridgePayload(payload){
  if (!payload || typeof payload !== 'object') return payload;
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch (err) {
    const copy = {};
    Object.keys(payload).forEach(key => {
      copy[key] = payload[key];
    });
    return copy;
  }
}

function buildBridge(state, role){
  return {
    publish(evt, payload){
      const listeners = state.listeners.get(evt);
      if (!listeners) return;
      const targets = Array.from(listeners);
      targets.forEach(entry => {
        if (!entry || entry.role === role) return;
        try {
          const copy = cloneBridgePayload(payload);
          if (copy && typeof copy === 'object' && (entry.role?.includes?.('client') || entry.role?.includes?.('join'))){
            copy.__fromNet = true;
          }
          entry.fn(copy);
        } catch (err) {
          /* ignore */
        }
      });
    },
    subscribe(evt, handler){
      if (typeof handler !== 'function') return () => {};
      if (!state.listeners.has(evt)) state.listeners.set(evt, new Set());
      const set = state.listeners.get(evt);
      const entry = { role, fn: handler };
      set.add(entry);
      return () => set.delete(entry);
    },
    getId(){ return role; }
  };
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

global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const bridgeState = createBridgeState();
global.Dustland = {
  multiplayer: { disconnect: () => {} },
  multiplayerBridge: buildBridge(bridgeState, 'host-main')
};

const hidden = [];
const shown = [];
global.UI = {
  remove: () => {},
  hide: id => hidden.push(id),
  show: id => shown.push(id)
};

const emittedEvents = [];
const listeners = new Map();
global.EventBus = {
  on(evt, fn){
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
  },
  off(evt, fn){
    listeners.get(evt)?.delete(fn);
  },
  emit(evt, payload){
    emittedEvents.push({ evt, payload });
    listeners.get(evt)?.forEach(fn => fn(payload));
  }
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
global.resetAll = () => {};

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
  const buttons = overlay.querySelector('#moduleList').children;
  assert.ok(buttons[0].className.includes('selected'));
  overlay.dispatchEvent({ type: 'keydown', key: 'ArrowDown', preventDefault(){} });
  assert.ok(buttons[1].className.includes('selected'));
});

test('module picker limits visible options and enables scrolling', () => {
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  const container = overlay.querySelector('#moduleList');
  assert.strictEqual(container.style.overflowY, 'auto');
  assert.strictEqual(container.style.maxHeight, '220px');
});

test('broadcast fragments are surfaced inside Dustland instead of picker entries', () => {
  assert.ok(!MODULES.some(m => m.file.includes('broadcast-fragment')));
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

test('host module click broadcasts selection', () => {
  emittedEvents.length = 0;
  const overlay = bodyEl.children.find(c => c.id === 'modulePicker');
  const buttons = overlay.querySelector('#moduleList').children;
  buttons[0].onclick();
  const evt = emittedEvents.find(e => e.evt === 'module-picker:select');
  assert.ok(evt);
  assert.strictEqual(evt.payload.moduleId, MODULES[0].id);
});

test('bridge relays host selection to joiner module picker', async () => {
  const sharedState = createBridgeState();
  function makeContext(kind){
    const body = stubEl();
    const head = stubEl();
    const loadBtn = stubEl();
    const listeners = new Map();
    const context = {
      requestAnimationFrame: () => {},
      window: null,
      innerWidth: 800,
      innerHeight: 600,
      addEventListener(){},
      document: {
        body,
        head,
        createElement: () => stubEl(),
        getElementById: id => id === 'loadBtn' ? loadBtn : null
      },
      UI: { remove: () => {}, hide: () => {}, show: () => {} },
      openCreator: () => {},
      showStart: () => {},
      resetAll: () => {},
      EventBus: {
        on(evt, fn){
          if (!listeners.has(evt)) listeners.set(evt, new Set());
          listeners.get(evt).add(fn);
        },
        off(evt, fn){ listeners.get(evt)?.delete(fn); },
        emit(evt, payload){ listeners.get(evt)?.forEach(fn => fn(payload)); }
      },
      localStorage: { getItem: () => null },
      sessionStorage: {
        getItem: () => kind === 'client' ? 'client' : null,
        setItem: () => {},
        removeItem: () => {}
      },
      Dustland: {
        multiplayer: { disconnect: () => {} },
        multiplayerBridge: buildBridge(sharedState, kind === 'client' ? 'join-game' : 'host-game')
      },
      location: { href: '' },
      console,
      Date,
      Math,
      setTimeout,
      clearTimeout
    };
    context.window = context;
    context.global = context;
    return { context, body };
  }

  const host = makeContext('host');
  vm.runInNewContext(code, host.context, { filename: '../scripts/module-picker.js' });
  const joiner = makeContext('client');
  vm.runInNewContext(code, joiner.context, { filename: '../scripts/module-picker.js' });

  const hostModules = vm.runInContext('MODULES', host.context);
  assert.ok(Array.isArray(hostModules) && hostModules.length > 2);
  const target = hostModules[2];
  const hostOverlay = host.body.children.find(c => c.id === 'modulePicker');
  const hostButtons = hostOverlay.querySelector('#moduleList').children;
  hostButtons[2].onclick();

  await new Promise(resolve => setImmediate(resolve));

  const joinOverlay = joiner.body.children.find(c => c.id === 'modulePicker');
  assert.ok(joinOverlay);
  const joinButtons = joinOverlay.querySelector('#moduleList').children;
  assert.ok(joinButtons[2]);
  const scriptEl = joiner.body.children.find(c => c.id === 'activeModuleScript');
  assert.ok(scriptEl);
  assert.ok(String(scriptEl.src || '').includes(target.file));
});

test('enter key loads selected module', () => {
  const golden = MODULES.find(m => m.id === 'golden');
  assert.ok(golden);
  loadModule(golden);
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

test('client role waits for host selection broadcast', () => {
  const body = stubEl();
  const head = stubEl();
  const loadBtn = stubEl();
  const emitted = [];
  const localListeners = new Map();
  const disconnectRoles = [];
  let removedRole = 0;
  const joinBridgeState = createBridgeState();
  const context = {
    requestAnimationFrame: () => {},
    window: null,
    innerWidth: 800,
    innerHeight: 600,
    addEventListener(){},
    document: {
      body,
      head,
      createElement: () => stubEl(),
      getElementById: id => id === 'loadBtn' ? loadBtn : null
    },
    UI: { remove: () => {}, hide: () => {}, show: () => {} },
    openCreator: () => {},
    showStart: () => {},
    resetAll: () => {},
    EventBus: {
      on(evt, fn){
        if (!localListeners.has(evt)) localListeners.set(evt, new Set());
        localListeners.get(evt).add(fn);
      },
      off(evt, fn){
        localListeners.get(evt)?.delete(fn);
      },
      emit(evt, payload){
        emitted.push({ evt, payload });
        localListeners.get(evt)?.forEach(fn => fn(payload));
      }
    },
    localStorage: { getItem: () => null },
    sessionStorage: {
      getItem: () => 'client',
      setItem: () => {},
      removeItem: key => { if (key === 'dustland.multiplayerRole') removedRole++; }
    },
    Dustland: {
      multiplayer: { disconnect: role => disconnectRoles.push(role) },
      multiplayerBridge: buildBridge(joinBridgeState, 'client-context')
    },
    location: { href: '' },
    console,
    Date,
    Math,
    setTimeout,
    clearTimeout
  };
  context.window = context;
  context.global = context;
  vm.runInNewContext(code, context, { filename: '../scripts/module-picker.js' });

  const overlay = body.children.find(c => c.id === 'modulePicker');
  assert.ok(overlay);
  const buttons = overlay.querySelector('#moduleList').children;
  assert.ok(buttons[0].disabled);

  const modules = vm.runInContext('MODULES', context);
  assert.ok(Array.isArray(modules) && modules.length > 1);
  const selection = {
    moduleId: modules[1].id,
    moduleName: modules[1].name,
    moduleFile: modules[1].file,
    __fromNet: true
  };
  context.EventBus.emit('module-picker:select', selection);
  const scriptEl = body.children.find(c => c.id === 'activeModuleScript');
  assert.ok(scriptEl);
  assert.ok(String(scriptEl.src || '').includes(modules[1].file));
  assert.ok(emitted.some(e => e.evt === 'module-picker:select'));

  const leaveBtn = overlay.querySelector('#leaveMultiplayer');
  assert.ok(leaveBtn);
  leaveBtn.onclick();
  assert.deepStrictEqual(disconnectRoles, ['client']);
  assert.equal(removedRole, 1);
  assert.strictEqual(context.location.href, 'dustland.html');
});
