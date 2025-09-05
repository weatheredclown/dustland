import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('broadcast fragments chain rewards', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  for(let i=1;i<=3;i++){
    const src = await fs.readFile(path.join(__dirname, '..', 'modules', `broadcast-fragment-${i}.module.js`), 'utf8');
    const json = src.match(/const DATA = `([\s\S]+?)`;/)[1];
    const data = JSON.parse(json);
    const rewardId = `signal_fragment_${i}`;
    const quest = data.quests.find(q => q.reward === rewardId);
    assert.ok(quest, `fragment ${i} should reward ${rewardId}`);
  }
});
