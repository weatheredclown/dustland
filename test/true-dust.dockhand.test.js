import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

test('dockhand branches on Rygar presence', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'true-dust.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { party: [], dialogState: { node: 'ask' }, NPCS: [], addQuest: () => {}, log: () => {}, console };
  vm.runInNewContext(src, sandbox);
  const mod = sandbox.TRUE_DUST;
  mod.postLoad(mod);
  const dock = mod.npcs.find(n => n.id === 'lakeside_dockhand');
  sandbox.dialogState.node = 'ask';
  dock.processNode('ask');
  assert.strictEqual(sandbox.dialogState.node, 'without_rygar');
  sandbox.party.push({ id: 'rygar' });
  sandbox.dialogState.node = 'ask';
  dock.processNode('ask');
  assert.strictEqual(sandbox.dialogState.node, 'with_rygar');
});
