import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

test('hidden crate registers sound source', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(__dirname, '..', 'modules', 'dustland.module.js');
  const src = fs.readFileSync(file, 'utf8');
  const sandbox = { soundSources: [], NPCS: [], addQuest: () => {}, log: () => {}, console };
  vm.runInNewContext(src, sandbox);
  const mod = sandbox.DUSTLAND_MODULE;
  mod.postLoad(mod);
  assert.ok(sandbox.soundSources.some(s => s.id === 'hidden_crate'));
});
