import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('broadcast NPCs inside Dustland award their fragments', async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = await fs.readFile(path.join(__dirname, '..', 'modules', 'dustland.module.js'), 'utf8');
  const json = src.match(/const DATA = `([\s\S]+?)`;/)[1];
  const data = JSON.parse(json);
  const sparks = data.npcs.find(n => n.id === 'sparks');
  const echo = data.npcs.find(n => n.id === 'echo_scavenger');
  const hermit = data.npcs.find(n => n.id === 'cave_hermit');
  assert.ok(sparks && echo && hermit);
  assert.strictEqual(sparks.questId, 'q_first_echo');
  assert.strictEqual(echo.questId, 'q_silent_tower');
  assert.strictEqual(hermit.questId, 'q_resonant_cave');
  assert.strictEqual(sparks.tree?.turnin?.choices?.[0]?.reward, 'signal_fragment_1');
  assert.strictEqual(echo.tree?.turnin?.choices?.[0]?.reward, 'signal_fragment_2');
  assert.strictEqual(hermit.tree?.turnin?.choices?.[0]?.reward, 'signal_fragment_3');
  assert.ok(!sparks.tree?.post_quest?.choices?.some(c => 'applyModule' in c));
  assert.ok(!echo.tree?.post_quest?.choices?.some(c => 'applyModule' in c));
});
