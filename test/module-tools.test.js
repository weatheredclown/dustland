import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readModule, setByPath, getByPath, appendByPath } from '../scripts/module-tools/utils.js';
import { execFileSync } from 'node:child_process';

test('read and write json module', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-'));
  const file = path.join(dir, 'test.module.json');
  fs.writeFileSync(file, JSON.stringify({ items: [] }, null, 2));
  const mod = readModule(file);
  appendByPath(mod.data, 'items', { id: 'a' });
  mod.write(mod.data);
  const mod2 = readModule(file);
  assert.equal(mod2.data.items[0].id, 'a');
});

test('read and write js module', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-'));
  const file = path.join(dir, 'test.module.js');
  fs.writeFileSync(file, 'const DATA = `\n{\n  "seed": "s"\n}\n`;\n');
  let mod = readModule(file);
  setByPath(mod.data, 'seed', 'x');
  mod.write(mod.data);
  mod = readModule(file);
  assert.equal(getByPath(mod.data, 'seed'), 'x');
});

test('add and edit npc via cli', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-'));
  const file = path.join(dir, 'npc.module.json');
  fs.writeFileSync(file, JSON.stringify({ npcs: [] }, null, 2));
  execFileSync('node', [
    'scripts/module-tools/add-npc.js',
    file,
    'id=n1',
    'map=world',
    'x=1',
    'y=2'
  ]);
  execFileSync('node', [
    'scripts/module-tools/edit-npc.js',
    file,
    'n1',
    'tree.start.text',
    'hi'
  ]);
  const mod = readModule(file);
  assert.equal(mod.data.npcs[0].tree.start.text, 'hi');
});

test('add and edit zone via cli', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mod-'));
  const file = path.join(dir, 'zone.module.json');
  fs.writeFileSync(file, JSON.stringify({ zones: [] }, null, 2));
  execFileSync('node', [
    'scripts/module-tools/add-zone.js',
    file,
    'map=world',
    'x=0',
    'y=0',
    'w=1',
    'h=1'
  ]);
  execFileSync('node', [
    'scripts/module-tools/edit-zone.js',
    file,
    '0',
    'perStep.msg',
    'ouch'
  ]);
  const mod = readModule(file);
  assert.equal(mod.data.zones[0].perStep.msg, 'ouch');
});
