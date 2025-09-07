import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('append-room adds linked interior', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'append-room-'));
  const file = path.join(dir, 'mod.json');
  const init = {
    interiors: [{ id: 'start', w: 3, h: 3, grid: ['🧱🧱🧱', '🧱🏝🧱', '🧱🧱🧱'], entryX: 1, entryY: 1 }],
    portals: []
  };
  await fs.writeFile(file, JSON.stringify(init, null, 2));
  const script = path.join('scripts', 'supporting', 'append-room.js');
  const res = spawnSync('node', [script, file, 'new', 'start']);
  assert.strictEqual(res.status, 0);
  const data = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.ok(data.interiors.some(r => r.id === 'new'));
  assert.ok(data.portals.find(p => p.map === 'start' && p.toMap === 'new'));
  assert.ok(data.portals.find(p => p.map === 'new' && p.toMap === 'start'));
});
