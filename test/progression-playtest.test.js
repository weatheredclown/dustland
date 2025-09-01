import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('first level reachable under ten minutes at assumed rate', async () => {
  const code = await fs.readFile(new URL('../scripts/core/party.js', import.meta.url), 'utf8');
  const context = { Dustland: { eventBus: { emit: () => {} } }, EventBus: { emit: () => {} }, log: () => {}, renderParty: () => {}, updateHUD: () => {} };
  vm.createContext(context);
  vm.runInContext(code, context);
  const firstLevelXp = context.xpCurve[1];
  const xpPerBattle = 15; // estimated XP per fight
  const secondsPerBattle = 45; // estimated duration
  const fights = Math.ceil(firstLevelXp / xpPerBattle);
  const totalSeconds = fights * secondsPerBattle;
  assert.ok(totalSeconds < 600);
});
