import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('music demo includes chill mood', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'music-demo.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /id: 'chill'/);
});
