import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const norm = value => JSON.parse(JSON.stringify(value));

async function loadUndoManager() {
  const dom = new JSDOM('<button id="undoBtn"></button><button id="redoBtn"></button>');
  const code = await fs.readFile(new URL('../scripts/ack-editor/undo-manager.js', import.meta.url), 'utf8');
  const applied = [];
  const sandbox = {
    document: dom.window.document,
    state: { v: 0 }
  };
  sandbox.ackExportModulePayload = () => ({ data: JSON.parse(JSON.stringify(sandbox.state)) });
  sandbox.ackGetWorld = () => [];
  sandbox.ackApplyLoadedModule = data => {
    applied.push(data);
    sandbox.state = data;
  };
  let dirtyCalls = 0;
  sandbox.markAckDirty = () => { dirtyCalls += 1; };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return {
    sandbox,
    applied,
    dom,
    dirtyCalls: () => dirtyCalls,
    undoBtn: dom.window.document.getElementById('undoBtn'),
    redoBtn: dom.window.document.getElementById('redoBtn')
  };
}

test('undo restores the recorded snapshot and redo reapplies the change', async () => {
  const env = await loadUndoManager();
  env.sandbox.state = { v: 1 };
  env.sandbox.ackRecordSnapshot();
  env.sandbox.state = { v: 2 };
  env.sandbox.ackUndo();
  assert.deepStrictEqual(norm(env.applied.at(-1)), { v: 1 });
  assert.ok(env.dirtyCalls() > 0, 'restore marks the module dirty');
  env.sandbox.ackRedo();
  assert.deepStrictEqual(norm(env.applied.at(-1)), { v: 2 });
});

test('snapshot round-trip preserves nested data exactly', async () => {
  const env = await loadUndoManager();
  const original = {
    name: 'mod',
    npcs: [{ id: 'a', tree: { start: { text: 'hi', choices: [{ label: 'x', to: 'bye' }] } } }],
    zones: [{ map: 'world', x: 1, y: 2, w: 3, h: 4, perStep: { hp: -1 } }]
  };
  env.sandbox.state = JSON.parse(JSON.stringify(original));
  env.sandbox.ackRecordSnapshot();
  env.sandbox.state = { name: 'clobbered' };
  env.sandbox.ackUndo();
  assert.deepStrictEqual(norm(env.applied.at(-1)), original);
});

test('undo with an empty stack is a no-op', async () => {
  const env = await loadUndoManager();
  env.sandbox.ackUndo();
  assert.strictEqual(env.applied.length, 0);
  env.sandbox.ackRedo();
  assert.strictEqual(env.applied.length, 0);
});

test('undo stack is capped at 50 snapshots', async () => {
  const env = await loadUndoManager();
  for (let i = 1; i <= 55; i++) {
    env.sandbox.state = { v: i };
    env.sandbox.ackRecordSnapshot();
  }
  let undos = 0;
  while (!env.undoBtn.disabled) {
    env.sandbox.ackUndo();
    undos += 1;
    assert.ok(undos <= 60, 'undo loop must terminate');
  }
  assert.strictEqual(undos, 50);
  assert.deepStrictEqual(norm(env.applied.at(-1)), { v: 6 }, 'oldest snapshots were dropped');
});

test('recording a new snapshot clears the redo stack', async () => {
  const env = await loadUndoManager();
  env.sandbox.state = { v: 1 };
  env.sandbox.ackRecordSnapshot();
  env.sandbox.state = { v: 2 };
  env.sandbox.ackUndo();
  env.sandbox.ackRecordSnapshot();
  const before = env.applied.length;
  env.sandbox.ackRedo();
  assert.strictEqual(env.applied.length, before, 'redo after new snapshot applies nothing');
});

test('undo/redo buttons reflect stack state', async () => {
  const env = await loadUndoManager();
  assert.strictEqual(env.undoBtn.disabled, true);
  assert.strictEqual(env.redoBtn.disabled, true);
  env.sandbox.state = { v: 1 };
  env.sandbox.ackRecordSnapshot();
  assert.strictEqual(env.undoBtn.disabled, false);
  env.sandbox.ackUndo();
  assert.strictEqual(env.undoBtn.disabled, true);
  assert.strictEqual(env.redoBtn.disabled, false);
});

test('button clicks trigger undo and redo', async () => {
  const env = await loadUndoManager();
  env.sandbox.state = { v: 1 };
  env.sandbox.ackRecordSnapshot();
  env.sandbox.state = { v: 2 };
  env.undoBtn.dispatchEvent(new env.dom.window.Event('click'));
  assert.deepStrictEqual(norm(env.applied.at(-1)), { v: 1 });
  env.redoBtn.dispatchEvent(new env.dom.window.Event('click'));
  assert.deepStrictEqual(norm(env.applied.at(-1)), { v: 2 });
});

