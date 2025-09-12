import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/core/quests.js', import.meta.url), 'utf8');
const context = { EventBus:{ emit: () => {} }, renderQuests: () => {}, log: () => {}, toast: () => {}, queueNanoDialogForNPCs: () => {}, console };
vm.createContext(context);
vm.runInContext(code, context);

const { addQuest, completeQuest, questLog } = context;

test('quest completion records outcome', () => {
  addQuest('q1', 'Test', '...', {});
  completeQuest('q1', 'good');
  const q = questLog.quests.q1;
  assert.strictEqual(q.status, 'completed');
  assert.strictEqual(q.outcome, 'good');
});
