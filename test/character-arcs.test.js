import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function read(file){
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
}

test('mara, jax, and nyx encounters exist', () => {
  const mara = read('modules/mara-puzzle.module.js');
  assert.match(mara, /dust_storm/);
  const jax = read('modules/jax-repair.module.js');
  assert.match(jax, /generator-meter/);
  const golden = JSON.parse(read('modules/golden.module.json'));
  const nyx = golden.npcs.find(n => n.id === 'nyx');
  assert.ok(nyx);
  assert.ok(Object.keys(nyx.tree).length > 3);
});
