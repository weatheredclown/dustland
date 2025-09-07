import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function loadModuleData() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const MARKER = 'const DATA = `';
  const start = src.indexOf(MARKER);
  const end = src.indexOf('`', start + MARKER.length);
  return JSON.parse(src.slice(start + MARKER.length, end));
}

test('dustland module includes respec vendor', () => {
  const data = loadModuleData();
  const npc = data.npcs.find(n => n.id === 'respec_vendor');
  assert.ok(npc);
  const labels = npc.tree.start.choices.map(c => c.label);
  assert.ok(labels.some(l => l.startsWith('Buy Memory Worm')));
});
