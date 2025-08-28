import assert from 'node:assert/strict';
import {test} from 'node:test';
import {extractTodos, markDone} from '../scripts/codex-todo-runner.js';

test('extractTodos handles quoted text', () => {
  const content = '- [ ] **Implement 5-10 Specials:** Create a starter set of special moves (e.g., "Power Strike," "Stun Grenade," "First Aid").';
  const todos = extractTodos(content);
  assert.equal(todos.length, 1);
  assert.equal(todos[0].text, '**Implement 5-10 Specials:** Create a starter set of special moves (e.g., "Power Strike," "Stun Grenade," "First Aid").');
  const done = markDone(content, todos[0].index);
  assert.match(done, /\[x\]/);
});
