import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function stubEl() {
  return { children: [], classList: { toggle() {} }, appendChild() {}, querySelector() {}, innerHTML: '', textContent: '' };
}

const overlay = stubEl();
const choicesEl = stubEl();
const dialogText = stubEl();
const npcName = stubEl();
const npcTitle = stubEl();
const portEl = stubEl();

global.document = {
  getElementById: (id) => ({ overlay, choices: choicesEl, dialogText, npcName, npcTitle, port: portEl }[id] || stubEl()),
  createElement: () => stubEl(),
  querySelector: () => stubEl()
};

global.window = global;

global.player = { inv: [] };
global.party = { x: 0, y: 0 };
global.state = {};
global.Dustland = { actions: { applyQuestReward() {} }, effects: { apply() {} } };
global.countItems = () => 0;
global.dialogJoinParty = () => {};
global.processQuestFlag = () => {};
global.handleGoto = () => {};

await import('../scripts/core/dialog.js');
const { advanceDialog } = globalThis;

function normalizeDialogTree(tree) {
  const out = {};
  for (const id in tree) {
    const n = tree[id];
    const next = (n.choices || []).map((c) => ({ id: c.to, label: c.label, to: c.to }));
    out[id] = { text: n.text || '', next };
  }
  return out;
}

function ensurePath(npcId, expectedNode) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'golden.module.json');
  const mod = JSON.parse(fs.readFileSync(file, 'utf8'));
  const npc = mod.npcs.find((n) => n.id === npcId);
  assert.ok(npc, `${npcId} npc exists`);
  const tree = normalizeDialogTree(npc.tree);
  const dialog = { tree, node: 'start' };
  advanceDialog(dialog, 0);
  advanceDialog(dialog, 0);
  assert.equal(dialog.node, expectedNode);
}

test('mara dialog progresses', () => {
  ensurePath('mara', 'bye');
});

test('jax dialog progresses', () => {
  ensurePath('jax', 'bye');
});
