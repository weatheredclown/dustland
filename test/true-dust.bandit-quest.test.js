import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const src = await fs.readFile(new URL('../modules/true-dust.module.js', import.meta.url), 'utf8');

const flags = {};

function setFlag(name, val){ flags[name] = val; }

test('bandit defeat sets flag', async () => {
  const context = { setInterval: () => 0, clearInterval: () => {}, setFlag, addQuest: () => {}, party: [] };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(src, context);
  const mod = context.TRUE_DUST;
  mod.postLoad(mod);
  const bandit = mod.npcs.find(n => n.id === 'bandit_leader');
  bandit.combat.effects[0]();
  assert.strictEqual(flags.bandits_cleared, 1);
});
