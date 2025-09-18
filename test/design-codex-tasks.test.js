import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {collectDesignTodos, buildCodexTasksPayload} from '../scripts/supporting/design-codex-tasks.js';

test('collectDesignTodos captures headings and ancestors', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'design-codex-'));
  const designDir = path.join(tempRoot, 'docs', 'design');
  fs.mkdirSync(designDir, {recursive: true});
  const doc = [
    '# Root Heading',
    '',
    '- [ ] Parent task',
    '  - [ ] Child task',
    '    - [ ] Grandchild task',
    '',
    '## Another Section',
    '',
    '- [ ] Final task',
  ].join('\n');
  fs.writeFileSync(path.join(designDir, 'sample.md'), doc);

  const todos = collectDesignTodos({root: tempRoot, designPath: designDir});
  assert.equal(todos.length, 4);

  const parent = todos.find(todo => todo.text === 'Parent task');
  assert.deepEqual(parent.headings, ['Root Heading']);
  assert.deepEqual(parent.ancestors, []);

  const child = todos.find(todo => todo.text === 'Child task');
  assert.deepEqual(child.ancestors, ['Parent task']);

  const grandchild = todos.find(todo => todo.text === 'Grandchild task');
  assert.deepEqual(grandchild.ancestors, ['Parent task', 'Child task']);

  const finalTask = todos.find(todo => todo.text === 'Final task');
  assert.deepEqual(finalTask.headings, ['Root Heading', 'Another Section']);
});

test('buildCodexTasksPayload sorts and formats entries', () => {
  const todos = [
    {
      id: 'docs/design/sample.md:3',
      text: 'First task',
      file: 'docs/design/sample.md',
      line: 3,
      headings: ['Root'],
      ancestors: [],
    },
    {
      id: 'docs/design/sample.md:5',
      text: 'Second task',
      file: 'docs/design/sample.md',
      line: 5,
      headings: ['Root'],
      ancestors: ['First task'],
    },
  ];

  const payload = buildCodexTasksPayload(todos);
  assert.equal(payload.taskCount, 2);
  assert.equal(payload.tasks.length, 2);
  assert.deepEqual(payload.tasks[0].codexCommand, ['codex', 'commit', 'First task']);
  assert.deepEqual(payload.tasks[1].source.ancestors, ['First task']);
});
