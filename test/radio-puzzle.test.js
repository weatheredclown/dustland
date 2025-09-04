import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('radio puzzle aligns to lock broadcast', async () => {
  const [dialSrc, puzzleSrc] = await Promise.all([
    fs.readFile(new URL('../components/dial.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../scripts/radio-tower-puzzle.js', import.meta.url), 'utf8')
  ]);
  const document = makeDocument();
  document.body.removeChild = () => {};
  const context = { document, Dustland: {}, log: msg => { context.msg = msg; } };
  vm.createContext(context);
  vm.runInContext(dialSrc, context);
  vm.runInContext(puzzleSrc, context);
  const puzzle = context.openRadioPuzzle();
  puzzle.dials[0].set(1);
  puzzle.dials[1].set(2);
  puzzle.dials[2].set(3);
  puzzle.alignBtn.onclick();
  assert.strictEqual(context.msg, 'Broadcast locks in.');
});
