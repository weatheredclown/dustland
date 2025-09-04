import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('true dust module defines safe zone and spawns', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'true-dust.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /noEncounters/);
  assert.match(src, /spawns/);
  assert.match(src, /Rygar/);
  assert.match(src, /maw_1/);
  assert.match(src, /maw_2/);
  assert.match(src, /maw_3/);
  assert.match(src, /maw_4/);
  assert.match(src, /mira_note/);
  assert.match(src, /Soldier Remnant/);

  const json = src.match(/const DATA = `([\s\S]+?)`;/)[1];
  const data = JSON.parse(json);
  const mawIds = ['maw_1', 'maw_2', 'maw_3', 'maw_4'];
  mawIds.forEach(id => {
    const room = data.interiors.find(i => i.id === id);
    assert.ok(room && room.w >= 8 && room.h >= 6);
  });
  const portals = data.portals;
  function hasPortal(map, x, y, toMap) {
    return portals.some(p => p.map === map && p.x === x && p.y === y && p.toMap === toMap);
  }
  assert.ok(hasPortal('stonegate', 5, 3, 'maw_1'));
  assert.ok(hasPortal('maw_1', 8, 3, 'maw_2'));
  assert.ok(hasPortal('maw_2', 8, 3, 'maw_3'));
  assert.ok(hasPortal('maw_3', 8, 3, 'maw_4'));
  const note = data.items.find(i => i.id === 'mira_note');
  assert.strictEqual(note.map, 'maw_4');
  assert.strictEqual(note.x, 7);
  assert.strictEqual(note.y, 3);
  const radio = data.items.find(i => i.id === 'cracked_radio');
  assert.ok(radio && radio.type === 'trinket');
  const caches = data.items.filter(i => i.id.startsWith('scrap_cache'));
  assert.strictEqual(caches.length, 3);
  const ganton = data.npcs.find(n => n.id === 'ganton');
  assert.ok(ganton && ganton.questId === 'bandit_purge');
  assert.ok(ganton.tree.reward.choices.some(c => c.reward === 'pulse_rifle'));
  assert.ok(data.npcs.some(n => n.id === 'bandit_leader'));
});
