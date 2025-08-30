import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('echoes module doors require quests with matching keys', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'echoes.module.js');
  const src = fs.readFileSync(file, 'utf8');
  assert.match(src, /"id": "q_spark"[\s\S]*"item": "spark_key"/);
  assert.match(src, /door_workshop[\s\S]*\(Search for Spark Key\)[\s\S]*"q": "accept"/);
  assert.match(src, /"id": "q_cog"[\s\S]*"item": "cog_key"/);
  assert.match(src, /door_archive[\s\S]*\(Search for Cog Key\)[\s\S]*"q": "accept"/);
});
