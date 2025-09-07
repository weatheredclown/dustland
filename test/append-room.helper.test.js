import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('append-room inserts and replaces directional exits', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'append-room-'));
  const file = path.join(dir, 'mod.json');
  const init = {
    interiors: [{ id: 'start', w: 3, h: 3, grid: ['🧱🧱🧱', '🧱🏝🧱', '🧱🧱🧱'], entryX: 1, entryY: 1 }],
    portals: []
  };
  await fs.writeFile(file, JSON.stringify(init, null, 2));
  const script = path.join('scripts', 'supporting', 'append-room.js');

  let res = spawnSync('node', [script, file, 'new', 'xxpxx,x   x,x   x,x   x,xxxxx', 'start']);
  assert.strictEqual(res.status, 0);
  let data = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.ok(data.portals.find(p => p.map === 'new' && p.x === 2 && p.y === 0 && p.toMap === 'start'));

  res = spawnSync('node', [script, file, 'new', 'xxxxx,x   x,x   x,x   x,xxpxx', '', '', 'start']);
  assert.strictEqual(res.status, 0);
  data = JSON.parse(await fs.readFile(file, 'utf8'));
  assert.ok(data.portals.find(p => p.map === 'new' && p.x === 2 && p.y === 4 && p.toMap === 'start'));
  assert.ok(!data.portals.find(p => p.map === 'new' && p.y === 0));
});
