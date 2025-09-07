import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('append-room visualizes vertical portals and walls', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'append-room-'));
  const file = path.join(dir, 'mod.json');
  const init = { interiors: [], portals: [] };
  await fs.writeFile(file, JSON.stringify(init, null, 2));
  const script = path.join('scripts', 'supporting', 'append-room.js');

  const res = spawnSync('node', [script, file, 'shaft', 'U:upper', 'D:lower']);
  assert.strictEqual(res.status, 0);

  const data = JSON.parse(await fs.readFile(file, 'utf8'));
  const room = data.interiors.find(r => r.id === 'shaft');
  assert.ok(room);
  assert.deepStrictEqual(room.grid, [
    '🧱🧱🧱🧱🧱',
    '🧱⬜U⬜🧱',
    '🧱⬜⬜⬜🧱',
    '🧱⬜D⬜🧱',
    '🧱🧱🧱🧱🧱'
  ]);
  assert.ok(data.portals.some(p => p.map === 'shaft' && p.x === 2 && p.y === 1 && p.toMap === 'upper'));
  assert.ok(data.portals.some(p => p.map === 'shaft' && p.x === 2 && p.y === 3 && p.toMap === 'lower'));
});
