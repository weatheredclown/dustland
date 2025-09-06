import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function noop() {}

async function loadQuestClass() {
  const code = await fs.readFile(new URL('../scripts/core/quests.js', import.meta.url), 'utf8');
  const sandbox = { renderQuests: noop, log: noop, EventBus: { emit: noop }, queueNanoDialogForNPCs: noop };
  vm.runInNewContext(code, sandbox);
  return sandbox.Quest;
}

test('pinned quests survive save/load cycle', async () => {
  const Quest = await loadQuestClass();
  const quests = { q1: new Quest('q1', 'Quest', '') };
  quests.q1.pinned = true;

  function save() {
    const questData = {};
    Object.keys(quests).forEach(k => {
      const q = quests[k];
      questData[k] = { title: q.title, desc: q.desc, status: q.status, pinned: q.pinned };
    });
    return JSON.stringify({ quests: questData });
  }

  function load(str) {
    const d = JSON.parse(str);
    const loaded = {};
    Object.keys(d.quests || {}).forEach(id => {
      const qd = d.quests[id];
      const q = new Quest(id, qd.title, qd.desc);
      q.status = qd.status;
      q.pinned = qd.pinned;
      loaded[id] = q;
    });
    return loaded;
  }

  const data = save();
  const restored = load(data);
  assert.equal(restored.q1.pinned, true);
});
