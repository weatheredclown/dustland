import assert from 'node:assert';
import { test } from 'node:test';

global.player = { hp: 10 };
const { GameState, gameState } = await import('../src/state/game-state.js');

test('GameState singleton exposes player health', () => {
  assert.strictEqual(gameState.getPlayerHealth(), 10);
  gameState.setPlayerHealth(5);
  assert.strictEqual(gameState.getPlayerHealth(), 5);
  assert.strictEqual(player.hp, 5);
  const gs2 = new GameState();
  assert.strictEqual(gs2, gameState);
});
