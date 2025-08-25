import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('office module boards castle and unboards via dialog', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(
    src,
    /placeHut\(WORLD_MID \+ 3, WORLD_MIDY - 2, {\s*\n\s*interiorId: 'castle',\s*\n\s*boarded: true\s*\n\s*}\)/
  );
  assert.match(src, /start: [\s\S]*?effect: 'unboardDoor',\s*interiorId: 'castle'[\s\S]*?unlock:/);
  assert.match(src, /label: '\(Fight\)'/);
});

test('startGame preserves generated world when applying module', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'office.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /applyModule\(OFFICE_MODULE,\s*\{\s*fullReset: false\s*}\)/);
});
