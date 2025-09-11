import assert from 'node:assert';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

test('two-worlds module defers start until world one loads', () => {
  let addedScript = null;
  const origDoc = global.document;
  const origOpen = global.openDialog;
  const origStart = global.startGame;
  const doc = {
    createElement: () => ({ onload: null, src: '' }),
    head: { appendChild(el) { addedScript = el; } }
  };
  global.document = doc;
  let dialogOpened = false;
  global.openDialog = () => { dialogOpened = true; };
  const src = fs.readFileSync(new URL('../modules/two-worlds.module.js', import.meta.url), 'utf8');
  vm.runInThisContext(src);
  assert.strictEqual(typeof startGame, 'function');
  let started = false;
  startGame = () => { started = true; };
  addedScript.onload();
  assert.ok(dialogOpened);
  startGame();
  assert.ok(started);
  if (origDoc === undefined) delete global.document; else global.document = origDoc;
  if (origOpen === undefined) delete global.openDialog; else global.openDialog = origOpen;
  if (origStart === undefined) delete global.startGame; else global.startGame = origStart;
});
