import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(repoRoot, 'scripts', 'supporting', 'placement-check.js');

function run(file) {
  return spawnSync('node', [script, file]);
}

test('placement check passes for valid module', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'place-ok-'));
  const mod = `const DATA = \`{\n"interiors":[{"id":"room","w":2,"h":2,"grid":["⬜⬜","⬜⬜"]}],\n"items":[{"id":"a","map":"room","x":0,"y":0}],\n"npcs":[{"id":"n","map":"room","x":1,"y":1}]\n}\`;`;
  const file = path.join(dir, 'sample.module.js');
  fs.writeFileSync(file, mod);
  const res = run(file);
  assert.strictEqual(res.status, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('placement check fails for wall placement', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'place-bad-'));
  const mod = `const DATA = \`{\n"interiors":[{"id":"room","w":2,"h":2,"grid":["🧱⬜","⬜⬜"]}],\n"items":[{"id":"a","map":"room","x":0,"y":0}]\n}\`;`;
  const file = path.join(dir, 'sample.module.js');
  fs.writeFileSync(file, mod);
  const res = run(file);
  assert.notStrictEqual(res.status, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

