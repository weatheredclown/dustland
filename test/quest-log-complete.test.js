import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function noop() {}

async function loadQuestsModule() {
  const code = await fs.readFile(new URL('../scripts/core/quests.js', import.meta.url), 'utf8');
  const events = [];
  const sandbox = {
    renderQuests: noop,
    log: noop,
    toast: noop,
    queueNanoDialogForNPCs: noop,
    EventBus: { emit: (name, payload) => events.push({ name, payload }) }
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  sandbox.__events = events;
  return sandbox;
}

test('questLog.complete upgrades plain quest data instead of crashing', async () => {
  const g = await loadQuestsModule();
  const { questLog } = g;
  questLog.quests.q1 = { id: 'q1', title: 'Fetch', name: 'Fetch', desc: '', status: 'active' };
  assert.doesNotThrow(() => questLog.complete('q1'));
  assert.strictEqual(questLog.quests.q1.status, 'completed');
  assert.strictEqual(typeof questLog.quests.q1.complete, 'function');
  assert.ok(g.__events.some(e => e.name === 'quest:completed' && e.payload?.quest?.id === 'q1'));
});

test('questLog.complete preserves quest data when upgrading plain entries', async () => {
  const g = await loadQuestsModule();
  const { questLog } = g;
  questLog.quests.q2 = { id: 'q2', title: 'Salvage', name: 'Salvage', desc: 'Bring scrap', status: 'active', pinned: true, reward: 'medkit' };
  questLog.complete('q2', 'good');
  const upgraded = questLog.quests.q2;
  assert.strictEqual(upgraded.title, 'Salvage');
  assert.strictEqual(upgraded.desc, 'Bring scrap');
  assert.strictEqual(upgraded.pinned, true);
  assert.strictEqual(upgraded.reward, 'medkit');
  assert.strictEqual(upgraded.outcome, 'good');
  assert.strictEqual(upgraded.status, 'completed');
});

test('questLog.complete ignores unknown quest ids', async () => {
  const g = await loadQuestsModule();
  assert.doesNotThrow(() => g.questLog.complete('missing'));
});

test('quest turn-in completes when the quest log holds plain quest data', async () => {
  // Regression: module loading used to store method-less quest objects directly
  // in questLog.quests; turning in such a quest crashed with
  // "quest?.complete is not a function".
  const g = await loadQuestsModule();
  const { questLog, defaultQuestProcessor } = g;
  const quest = { id: 'q3', title: 'Scrap Run', name: 'Scrap Run', desc: '', status: 'active', item: 'scrap', count: 1 };
  questLog.quests.q3 = quest;
  g.player = { inv: [{ id: 'scrap', name: 'Scrap' }] };
  const result = defaultQuestProcessor({ quest }, 'do_turnin');
  assert.ok(result?.completed);
  assert.strictEqual(quest.status, 'completed');
  assert.strictEqual(questLog.quests.q3.status, 'completed');
});
