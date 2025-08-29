import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('game state exposes shared data and updater', async () => {
  const code = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInThisContext(code, { filename: 'game-state.js' });
  const gs = globalThis.Dustland.gameState;
  assert.ok(gs);
  const state = gs.getState();
  assert.deepEqual(state.party, []);
  gs.updateState(s => { s.flags.level = 1; });
  assert.equal(gs.getState().flags.level, 1);
});
