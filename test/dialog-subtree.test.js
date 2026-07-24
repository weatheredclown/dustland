import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const code = await fs.readFile(new URL('../scripts/adventure-kit.js', import.meta.url), 'utf8');
const normalized = code.replace(/\r\n/g, '\n');
const collectCode = normalized.match(/function collectDialogSubtree[\s\S]*?\n}\n/)[0];
const mergeCode = normalized.match(/function mergeDialogNodes[\s\S]*?\n}\n/)[0];
vm.runInThisContext(collectCode + mergeCode);

test('collectDialogSubtree gathers the root and reachable descendants only', () => {
  const tree = {
    start: { text: 'hi', choices: [{ label: 'a', to: 'a' }, { label: 'leave', to: 'bye' }] },
    a: { text: 'A', choices: [{ label: 'b', to: 'b' }] },
    b: { text: 'B', choices: [] },
    unrelated: { text: 'X', choices: [] },
    imports: { flags: ['f'] }
  };
  const nodes = collectDialogSubtree(tree, 'a');
  assert.deepStrictEqual(Object.keys(nodes).sort(), ['a', 'b']);
  assert.strictEqual(nodes.a.text, 'A');
});

test('collectDialogSubtree handles cycles and missing targets', () => {
  const tree = {
    a: { text: 'A', choices: [{ label: 'b', to: 'b' }, { label: 'ghost', to: 'missing' }] },
    b: { text: 'B', choices: [{ label: 'back', to: 'a' }] }
  };
  const nodes = collectDialogSubtree(tree, 'a');
  assert.deepStrictEqual(Object.keys(nodes).sort(), ['a', 'b']);
});

test('collectDialogSubtree returns deep copies, not references', () => {
  const tree = { a: { text: 'A', choices: [{ label: 'x', to: 'bye' }] } };
  const nodes = collectDialogSubtree(tree, 'a');
  nodes.a.text = 'mutated';
  nodes.a.choices[0].label = 'mutated';
  assert.strictEqual(tree.a.text, 'A');
  assert.strictEqual(tree.a.choices[0].label, 'x');
});

test('mergeDialogNodes keeps ids when there is no collision', () => {
  const tree = { start: { text: 's', choices: [] } };
  const root = mergeDialogNodes(tree, { lore: { text: 'L', choices: [{ label: 'more', to: 'lore2' }] }, lore2: { text: 'L2', choices: [] } }, 'lore');
  assert.strictEqual(root, 'lore');
  assert.strictEqual(tree.lore.text, 'L');
  assert.strictEqual(tree.lore.choices[0].to, 'lore2');
});

test('mergeDialogNodes renames on collision and remaps internal links', () => {
  const tree = {
    start: { text: 's', choices: [] },
    accept: { text: 'existing accept', choices: [] }
  };
  const nodes = {
    job: { text: 'J', choices: [{ label: 'yes', to: 'accept' }, { label: 'leave', to: 'bye' }] },
    accept: { text: 'new accept', choices: [] }
  };
  const root = mergeDialogNodes(tree, nodes, 'job');
  assert.strictEqual(root, 'job');
  assert.strictEqual(tree.accept.text, 'existing accept', 'existing node untouched');
  assert.strictEqual(tree['accept-1'].text, 'new accept');
  assert.strictEqual(tree.job.choices[0].to, 'accept-1', 'internal link remapped to renamed node');
  assert.strictEqual(tree.job.choices[1].to, 'bye', 'external link untouched');
});

test('mergeDialogNodes avoids chains of collisions', () => {
  const tree = { a: {}, 'a-1': {} };
  const root = mergeDialogNodes(tree, { a: { text: 'new', choices: [] } }, 'a');
  assert.strictEqual(root, 'a-2');
  assert.strictEqual(tree['a-2'].text, 'new');
});
