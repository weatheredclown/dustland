import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const src = await fs.readFile(new URL('../modules/true-dust.module.js', import.meta.url), 'utf8');

test('mask quest requires mask tag and manual start', async () => {
  const added = [];
  const context = {
    setInterval: () => 0,
    clearInterval: () => {},
    setFlag: () => {},
    addQuest: (...args) => { added.push(args); },
    party: [],
    dialogState: {},
    console
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(src, context);
  const mod = context.TRUE_DUST;
  mod.postLoad(mod);

  const quest = mod.quests.find(q => q.id === 'mask_memory');
  assert.ok(quest, 'mask quest is registered');
  assert.strictEqual(quest.itemTag, 'mask');
  assert.strictEqual(quest.count, 1);
  assert.strictEqual(quest.reward, 'mara_mask');
  assert.strictEqual(quest.autoStart, false);

  assert.ok(added.some(([id]) => id === 'bandit_purge'));
  assert.ok(!added.some(([id]) => id === 'mask_memory'));

  const npc = mod.npcs.find(n => n.id === 'mask_giver');
  assert.ok(npc, 'mask giver exists');
  assert.strictEqual(npc.questId, 'mask_memory');
  const accept = npc.tree.start.choices.find(c => c.q === 'accept');
  assert.ok(accept, 'accept choice wired');
  assert.strictEqual(accept.if.flag, 'mask_memory_stage');
  assert.strictEqual(accept.setFlag?.value, 1);
  const turnin = npc.tree.start.choices.find(c => c.q === 'turnin');
  assert.ok(turnin, 'turn-in choice wired');
  assert.strictEqual(turnin.if.value, 1);
});
