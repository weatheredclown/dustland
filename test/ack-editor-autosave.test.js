import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

function makeStorage() {
  const store = new Map();
  return {
    store,
    failNextSet: false,
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) {
      if (this.failNextSet) throw new Error('QuotaExceededError');
      store.set(key, String(value));
    },
    removeItem(key) { store.delete(key); }
  };
}

async function loadAutosave({ confirmResult = true } = {}) {
  const dom = new JSDOM('<span id="dirtyIndicator"></span><span id="autosaveStatus"></span>');
  const code = await fs.readFile(new URL('../scripts/ack-editor/autosave.js', import.meta.url), 'utf8');
  const storage = makeStorage();
  const listeners = {};
  const captured = { interval: null, timeout: null };
  const confirms = [];
  const sandbox = {
    document: dom.window.document,
    localStorage: storage,
    window: {
      addEventListener(name, fn) { listeners[name] = fn; }
    },
    confirm(msg) { confirms.push(msg); return confirmResult; },
    setInterval(fn) { captured.interval = fn; return 1; },
    setTimeout(fn) { captured.timeout = fn; return 1; }
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { sandbox, dom, storage, listeners, captured, confirms };
}

test('markAckDirty and clearAckDirty update indicator and title', async () => {
  const env = await loadAutosave();
  const indicator = env.dom.window.document.getElementById('dirtyIndicator');
  assert.strictEqual(env.sandbox.isAckDirty(), false);
  env.sandbox.markAckDirty();
  assert.strictEqual(env.sandbox.isAckDirty(), true);
  assert.strictEqual(indicator.textContent, ' *');
  assert.ok(env.dom.window.document.title.startsWith('*'));
  env.sandbox.clearAckDirty();
  assert.strictEqual(env.sandbox.isAckDirty(), false);
  assert.strictEqual(indicator.textContent, '');
});

test('autosave writes the exported module when dirty and reports the time', async () => {
  const env = await loadAutosave();
  env.sandbox.ackExportModulePayload = () => ({ data: { name: 'mod', npcs: [] } });
  env.sandbox.ackDoAutosave();
  assert.strictEqual(env.storage.store.has('ack_autosave'), false, 'clean editor skips autosave');
  env.sandbox.markAckDirty();
  env.sandbox.ackDoAutosave();
  assert.deepStrictEqual(JSON.parse(env.storage.store.get('ack_autosave')), { name: 'mod', npcs: [] });
  const status = env.dom.window.document.getElementById('autosaveStatus');
  assert.ok(status.textContent.startsWith('Autosaved'), status.textContent);
});

test('autosave surfaces storage quota failures instead of failing silently', async () => {
  const env = await loadAutosave();
  env.sandbox.ackExportModulePayload = () => ({ data: { name: 'mod' } });
  env.sandbox.markAckDirty();
  env.storage.failNextSet = true;
  env.sandbox.ackDoAutosave();
  const status = env.dom.window.document.getElementById('autosaveStatus');
  assert.ok(/Autosave failed/.test(status.textContent), status.textContent);
});

test('a failed export leaves the previous autosave intact', async () => {
  const env = await loadAutosave();
  env.storage.store.set('ack_autosave', '{"name":"previous"}');
  env.sandbox.ackExportModulePayload = () => { throw new Error('boom'); };
  env.sandbox.markAckDirty();
  env.sandbox.ackDoAutosave();
  assert.strictEqual(env.storage.store.get('ack_autosave'), '{"name":"previous"}');
});

test('beforeunload warns only when there are unsaved changes', async () => {
  const env = await loadAutosave();
  const handler = env.listeners.beforeunload;
  assert.strictEqual(typeof handler, 'function');
  let prevented = 0;
  const evt = { preventDefault() { prevented += 1; }, returnValue: undefined };
  handler(evt);
  assert.strictEqual(prevented, 0, 'clean editor does not block unload');
  env.sandbox.markAckDirty();
  handler(evt);
  assert.strictEqual(prevented, 1);
  assert.strictEqual(evt.returnValue, '');
});

test('restore prompt applies the stored module and clears it', async () => {
  const env = await loadAutosave({ confirmResult: true });
  env.storage.store.set('ack_autosave', JSON.stringify({ name: 'recovered', npcs: [] }));
  const appliedData = [];
  env.sandbox.ackApplyLoadedModule = data => appliedData.push(data);
  env.captured.timeout();
  assert.strictEqual(env.confirms.length, 1);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(appliedData)), [{ name: 'recovered', npcs: [] }]);
  assert.strictEqual(env.storage.store.has('ack_autosave'), false);
});

test('declining the restore prompt discards the autosave', async () => {
  const env = await loadAutosave({ confirmResult: false });
  env.storage.store.set('ack_autosave', JSON.stringify({ name: 'recovered' }));
  const appliedData = [];
  env.sandbox.ackApplyLoadedModule = data => appliedData.push(data);
  env.captured.timeout();
  assert.strictEqual(appliedData.length, 0);
  assert.strictEqual(env.storage.store.has('ack_autosave'), false);
});

