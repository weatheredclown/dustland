import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('dustland module includes patrolling enemy', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'stalker_patrol'/);
  assert.match(src, /portraitSheet: 'assets\/portraits\/portrait_1079\.png'/);
  assert.match(src, /loop: \[\s*{ x: 90, y: midY \+ 2 },\s*{ x: 110, y: midY \+ 2 },\s*{ x: 110, y: midY - 6 },\s*{ x: 90, y: midY - 6 }\s*\]/);
  assert.match(src, /combat: { HP: 7, ATK: 2, DEF: 1, loot: 'raider_knife', auto: true }/);
});

test('dustland module includes plot improvements', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'road_sign'/);
  assert.match(src, /hall sheltered survivors/);
  assert.match(src, /Radio crackles from the north; idol whispers from the south/);
});

test('dustland module warns about hall monster', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'hall_rotwalker'/);
  assert.match(src, /rotwalker at the top of the hall/);
});
