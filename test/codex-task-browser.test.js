import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {
  loadCodexTasks,
  normalizeTasks,
  filterTasks,
  pickTask,
  formatTask,
} from '../scripts/supporting/codex-task-browser.js';

test('loadCodexTasks reads and validates payload', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-task-browser-'));
  const filePath = path.join(tempDir, 'codex-tasks.json');
  const payload = {
    generatedAt: '2025-01-01T00:00:00.000Z',
    taskCount: 1,
    tasks: [{
      id: 'docs/design/sample.md:12',
      title: 'Prototype scheduler',
      codexCommand: ['codex', 'commit', 'Prototype scheduler'],
      source: {file: 'docs/design/sample.md', line: 12, headings: ['Root'], ancestors: []},
    }],
  };
  fs.writeFileSync(filePath, JSON.stringify(payload));

  const {payload: loaded, resolvedPath} = loadCodexTasks(filePath);
  assert.equal(resolvedPath, filePath);
  assert.equal(loaded.tasks[0].title, 'Prototype scheduler');
});

test('normalizeTasks fills optional fields', () => {
  const tasks = normalizeTasks([
    {
      id: 'docs/design/sample.md:5',
      title: 'Add fast travel',
      source: {file: 'docs/design/sample.md', line: 5},
    },
    {},
  ]);

  assert.equal(tasks[0].codexCommand.length, 0);
  assert.deepEqual(tasks[0].source.headings, []);
  assert.equal(tasks[1].id, '');
  assert.equal(tasks[1].title, '');
});

test('filterTasks matches across metadata', () => {
  const tasks = normalizeTasks([
    {
      id: 'docs/design/a.md:3',
      title: 'Tune scrap rewards',
      codexCommand: ['codex', 'commit', 'Tune scrap rewards'],
      source: {file: 'docs/design/a.md', headings: ['Economy'], ancestors: []},
    },
    {
      id: 'docs/design/b.md:7',
      title: 'Improve trader grudge system',
      source: {file: 'docs/design/b.md', headings: ['Vendors'], ancestors: ['Tune scrap rewards']},
    },
  ]);

  const filtered = filterTasks(tasks, 'grudge');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'docs/design/b.md:7');

  const ancestorFiltered = filterTasks(tasks, 'scrap rewards');
  assert.equal(ancestorFiltered.length, 2);
});

test('pickTask resolves indexes and ids', () => {
  const tasks = normalizeTasks([
    {id: 'alpha', title: 'A'},
    {id: 'beta', title: 'B'},
  ]);

  assert.equal(pickTask(tasks, '1').id, 'alpha');
  assert.equal(pickTask(tasks, 'beta').title, 'B');
  assert.equal(pickTask(tasks, '3'), null);
});

test('formatTask prints multi-line summary', () => {
  const task = normalizeTasks([{
    id: 'docs/design/sample.md:10',
    title: 'Document scheduler API',
    codexCommand: ['codex', 'commit', 'Document scheduler API'],
    source: {
      file: 'docs/design/sample.md',
      line: 10,
      headings: ['Reactive Systems'],
      ancestors: ['Build scheduler'],
    },
  }])[0];

  const output = formatTask(task, 0);
  assert.match(output, /^1\. Document scheduler API/m);
  assert.match(output, /docs\/design\/sample\.md:10/);
  assert.match(output, /Command: codex commit Document scheduler API/);
  assert.match(output, /Headings: Reactive Systems/);
  assert.match(output, /Ancestors: Build scheduler/);
});
